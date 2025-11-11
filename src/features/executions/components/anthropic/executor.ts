import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import handlebars from "handlebars";
import { AnthropicChannel } from "@/inngest/channels/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { AnthropicNodeData as AnthropicTriggerData } from "./anthropici-node";
import { anthropic } from "@ai-sdk/anthropic";

handlebars.registerHelper(
  "json",
  (context) => new handlebars.SafeString(JSON.stringify(context, null, 2)),
);

export const AnthropicTriggerExecutor: NodeExecutor<
  AnthropicTriggerData
> = async ({ nodeId, context, step, data, publish }) => {
  await publish(AnthropicChannel().status({ nodeId, status: "loading" }));
  const systemPrompt = data.systemPrompt
    ? handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  if (!data.userPrompt) {
    await publish(AnthropicChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("User prompt is required");
  }

  if (!data.variableName) {
    await publish(AnthropicChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Anthropic variable name is missing");
  }
  const userPrompt = handlebars.compile(data.userPrompt)(context);

  // TODO : fetch user credentials
  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const google = createGoogleGenerativeAI({ apiKey: credentialValue });

  try {
    const { steps } = await step.ai.wrap(
      "Anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || "claude-3-5-haiku-latest"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const text =
      steps[0].content[0].type == "text" ? steps[0].content[0].text : "";
    await publish(AnthropicChannel().status({ nodeId, status: "success" }));

    return { ...context, [data.variableName]: { aiResponse: text } };
  } catch (err) {
    await publish(AnthropicChannel().status({ nodeId, status: "error" }));
    throw err;
  }
};
