import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { ManualTriggerExecutor } from "@/features/triggers/manual-trigger/executor";
import { HttpRequestTriggerExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/google-form-trigger/executor";
import { StripeTriggerExecutor } from "@/features/triggers/stripe-trigger/executor";
import { GeminiTriggerExecutor } from "../components/gemini/executor";
import { OpenAiNode } from "../components/openai/openai-node";
import { AnthropicNode } from "../components/anthropic/anthropici-node";

export const ExecutorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.AI]: ManualTriggerExecutor,
  [NodeType.HTTP_API]: ManualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: HttpRequestTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerExecutor,
  // @ts-ignore
  [NodeType.AI_GOOGLE]: GeminiTriggerExecutor,
  // @ts-ignore
  [NodeType.AI_OPENAI]: OpenAiNode,
  // @ts-ignore
  [NodeType.AI_ANTHROPIC]: AnthropicNode,

  [NodeType.INITIAL]: ManualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerExecutor,
  [NodeType.TIMED_TRIGGER]: ManualTriggerExecutor,
  [NodeType.UPLOAD_ALL]: ManualTriggerExecutor,
  [NodeType.UPLOAD_IMAGE]: ManualTriggerExecutor,
  [NodeType.UPLOAD_PDF]: ManualTriggerExecutor,
  [NodeType.UPLOAD_TEXT]: ManualTriggerExecutor,
  [NodeType.UPLOAD_VIDEO]: ManualTriggerExecutor,
};

export const getExecutor = (node: NodeType): NodeExecutor =>
  ExecutorRegistry[node];
