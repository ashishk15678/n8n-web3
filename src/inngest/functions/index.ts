import { inngest } from "../client";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { topoLogicalSort } from "../utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "../channels/http-request";
import { manualTriggerChannel } from "../channels/manual-trigger";
import { googleFormTriggerChannel } from "../channels/google-form-trigger";
import { stripeTriggerChannel } from "../channels/stripe-trigger";
import { GeminiChannel } from "../channels/gemini";
import { AnthropicChannel } from "../channels/anthropic";
import { openaiChannel } from "../channels/openai";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      GeminiChannel(),
      AnthropicChannel(),
      openaiChannel(),
    ],
  },
  async ({ event, step, publish }) => {
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
        publish,
      });
    }
    return { result: context, workflowId };
  },
);
