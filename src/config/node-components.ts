import { InitalNode } from "@/components/inital-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/http-request-node";
import { ManualTriggerNode } from "@/features/triggers/manual-trigger/manual-trigger-node";
import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";
import {
  AllUploadNode,
  ImageUploadNode,
  PdfUploadNode,
  TextUploadNode,
  VideoUploadNode,
} from "@/features/manual-upload/upload-node";
import { GoogleFormTriggerNode } from "@/features/triggers/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/stripe-trigger/node";
import { GeminiNode } from "@/features/executions/components/gemini/gemini-node";
import { AnthropicNode } from "@/features/executions/components/anthropic/anthropici-node";
import { OpenAiNode } from "@/features/executions/components/openai/openai-node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitalNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,

  // AI
  [NodeType.AI_GOOGLE]: GeminiNode,
  [NodeType.AI_ANTHROPIC]: AnthropicNode,
  [NodeType.TIMED_TRIGGER]: GeminiNode,
  [NodeType.AI_OPENAI]: OpenAiNode,

  //Upload
  [NodeType.UPLOAD_IMAGE]: ImageUploadNode,
  [NodeType.UPLOAD_PDF]: PdfUploadNode,
  [NodeType.UPLOAD_TEXT]: TextUploadNode,
  [NodeType.UPLOAD_VIDEO]: VideoUploadNode,
  [NodeType.UPLOAD_ALL]: AllUploadNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
