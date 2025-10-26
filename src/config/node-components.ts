import { InitalNode } from "@/components/inital-node";
import { HttpRequestNode } from "@/features/executions/components/http-request/http-request-node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/manual-trigger-node";
import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitalNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
