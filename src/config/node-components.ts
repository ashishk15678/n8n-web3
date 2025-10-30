import { InitalNode } from "@/components/inital-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/http-request-node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/manual-trigger-node";
import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";
import { AINode } from "@/features/ainode/node";
import { GoogleAiNode } from "@/features/ainode/GoogleNode";
import { AnthropicAiNode } from "@/features/ainode/AnthropicNode";
import { OpenAiNode } from "@/features/ainode/OpenAINode";
import AIAgentNode from "@/features/ainode/ai-agent-node";
import {
  AllUploadNode,
  ImageUploadNode,
  PdfUploadNode,
  TextUploadNode,
  VideoUploadNode,
} from "@/features/manual-upload/upload-node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitalNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,

  // AI
  [NodeType.AI_GOOGLE]: GoogleAiNode,
  [NodeType.AI_ANTHROPIC]: AnthropicAiNode,
  [NodeType.TIMED_TRIGGER]: AIAgentNode,
  [NodeType.AI_OPENAI]: OpenAiNode,

  //Upload
  [NodeType.UPLOAD_IMAGE]: ImageUploadNode,
  [NodeType.UPLOAD_PDF]: PdfUploadNode,
  [NodeType.UPLOAD_TEXT]: TextUploadNode,
  [NodeType.UPLOAD_VIDEO]: VideoUploadNode,
  [NodeType.UPLOAD_ALL]: AllUploadNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
