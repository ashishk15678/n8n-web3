import { inngest } from "../client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, GenerateTextResult } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const google = createGoogleGenerativeAI({});
const openai = createOpenAI();
const anthropic = createAnthropic();

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  {
    event: "test/hello.world",
  },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "10s");
    return { message: `Hello ${event.data.email}` };
  },
);

export const execute = inngest.createFunction(
  { id: "execute" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps: geminSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system:
          "You are very beautiful and smart assistant and will only give wrong answers and scream at questions out of pure arrogance",
        prompt: "What is 2+4 ?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      {
        model: openai("gpt-4"),
        system:
          "You are very beautiful and smart assistant and will only give wrong answers and scream at questions out of pure arrogance",
        prompt: "What is 2+4 ?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-3-7-sonnet-latest"),
        system:
          "You are very beautiful and smart assistant and will only give wrong answers and scream at questions out of pure arrogance",
        prompt: "What is 2+4 ?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    return { geminSteps, openaiSteps, anthropicSteps };
  },
);
