"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { WorkflowNode } from "../../components/workflow-node";
import {
  BaseNode,
  BaseNodeContent,
} from "../../components/reactflow/base-node";
import Image from "next/image";
import { BaseHandle } from "../../components/reactflow/base-handle";
import {
  NodeStatus,
  NodeStatusIndicator,
} from "@/components/reactflow/node-status-indicator";

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = ({
  id,
  icon: Icon,
  name,
  status = "initial",
  description,
  children,
  onDoubleClick,
  onSettings,
}: BaseExecutionNodeProps) => {
  const { setNodes, setEdges } = useReactFlow();
  const handleDelete = () => {
    setNodes((currentNode) => currentNode.filter((node) => node.id !== id));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
    );
  };

  return (
    <WorkflowNode
      name={name}
      description={description}
      onDelete={handleDelete}
      onSettings={onSettings}
    >
      <NodeStatusIndicator status={status}>
        <BaseNode status={status} onDoubleClick={onDoubleClick}>
          <BaseNodeContent>
            {typeof Icon == "string" ? (
              <Image alt={name} src={Icon} width={16} height={16} />
            ) : (
              <>
                <Icon className="size-4 text-muted-foreground" />
              </>
            )}
            {children}
            <BaseHandle id="target-1" type="target" position={Position.Left} />
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
};

BaseExecutionNode.displayName = "BaseExecutionNode";
