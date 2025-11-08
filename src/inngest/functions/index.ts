import { inngest } from "../client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, GenerateTextResult } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { topoLogicalSort } from "../utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";

const google = createGoogleGenerativeAI({});
const openai = createOpenAI();
const anthropic = createAnthropic();

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute.workflow" },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;
    if (!workflowId) throw new NonRetriableError("Workflow Id is missing");

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: { nodes: true, connections: true },
      });
      if (!workflow) throw new NonRetriableError("No such workflow");

      return topoLogicalSort({
        nodes: workflow.nodes,
        connections: workflow.connections,
      });
    });

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
      });
    }
    return { result: context, workflowId };
  },
);
