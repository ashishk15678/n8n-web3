import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { ManualTriggerExecutor } from "@/features/triggers/manual-trigger/executor";
import { HttpRequestTriggerExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/google-form-trigger/executor";
import { StripeTriggerExecutor } from "@/features/triggers/stripe-trigger/executor";

export const ExecutorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.AI]: ManualTriggerExecutor,
  [NodeType.AI_ANTHROPIC]: ManualTriggerExecutor,
  [NodeType.AI_GOOGLE]: ManualTriggerExecutor,
  [NodeType.AI_OPENAI]: ManualTriggerExecutor,
  [NodeType.HTTP_API]: ManualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: HttpRequestTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerExecutor,
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
