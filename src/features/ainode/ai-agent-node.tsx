"use client";

import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/reactflow/base-node";
import { NodeProps, Position } from "@xyflow/react";
import { BaseExecutionNode } from "../executions/base-execution-node";
import { AirplayIcon } from "lucide-react";
import { NodeStatusIndicator } from "@/components/reactflow/node-status-indicator";
import { BaseHandle } from "@/components/reactflow/base-handle";
import { LabeledHandle } from "@/components/reactflow/labeled-handle";

export default function AIAgentNode({ ...props }: NodeProps) {
  const status = "initial";
  return (
    <BaseNode {...props} status={status}>
      <NodeStatusIndicator status={status}>
        <BaseNodeHeader>
          <BaseNodeHeaderTitle>Ai agent node</BaseNodeHeaderTitle>
        </BaseNodeHeader>

        <LabeledHandle
          title="Memory"
          id="Memory"
          className=""
          position={Position.Left}
          type="target"
        />
        <LabeledHandle
          title="AI Model"
          id="ai-model"
          position={Position.Bottom}
          type="target"
        />
      </NodeStatusIndicator>
    </BaseNode>
  );
}
