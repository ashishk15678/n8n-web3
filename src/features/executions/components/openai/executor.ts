import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import handlebars from "handlebars";
import { openaiChannel } from "@/inngest/channels/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { OpenaiNodeData as OpenaiTriggerData } from "./openai-node";
import { openai } from "@ai-sdk/openai";

handlebars.registerHelper(
  "json",
  (context) => new handlebars.SafeString(JSON.stringify(context, null, 2)),
);

export const OpenaiTriggerExecutor: NodeExecutor<OpenaiTriggerData> = async ({
  nodeId,
  context,
  step,
  data,
  publish,
}) => {
  await publish(openaiChannel().status({ nodeId, status: "loading" }));
  const systemPrompt = data.systemPrompt
    ? handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  if (!data.userPrompt) {
    await publish(openaiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("User prompt is required");
  }

  if (!data.variableName) {
    await publish(openaiChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Openai variable name is missing");
  }
  const userPrompt = handlebars.compile(data.userPrompt)(context);

  // TODO : fetch user credentials
  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  try {
    const { steps } = await step.ai.wrap("Openai-generate-text", generateText, {
      model: openai(data.model || "gpt-3.5-turbo"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type == "text" ? steps[0].content[0].text : "";
    await publish(openaiChannel().status({ nodeId, status: "success" }));

    return { ...context, [data.variableName]: { aiResponse: text } };
  } catch (err) {
    await publish(openaiChannel().status({ nodeId, status: "error" }));
    throw err;
  }
};
