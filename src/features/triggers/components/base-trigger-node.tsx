"use client";

import { BaseHandle } from "@/components/reactflow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/reactflow/base-node";
import {
  NodeStatus,
  NodeStatusIndicator,
} from "@/components/reactflow/node-status-indicator";
import { WorkflowNode } from "@/components/workflow-node";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { WandSparklesIcon, ZapIcon, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { type ReactNode } from "react";
import { emitToConnected } from "@/features/workflow/trigger-bus";
import { toast } from "sonner";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
  onTrigger: () => void;
}

export const BaseTriggerNode = ({
  id,
  icon: Icon,
  name,
  description,
  status = "initial",
  children,
  onDoubleClick,
  onSettings,
  onTrigger,
}: BaseTriggerNodeProps) => {
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();
  const handleDelete = () => {
    setNodes((currentNode) => currentNode.filter((node) => node.id !== id));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
    );
  };

  const node = getNode(id);

  if (!node) toast.error("Some nodes are undefined.");
  if (node && node.data.status) {
    setNodes((node) =>
      node.map((n) => {
        if (n.id == id) return { ...n, data: { ...n.data, status: "initial" } };
        return n;
      }),
    );
  }

  const handleTrigger = () => {
    setNodes((node) =>
      node.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, status: "loading" } } : n,
      ),
    );
    try {
      onTrigger?.();
      emitToConnected(id, { data: undefined, error: undefined }, { getEdges });
      setNodes((node) =>
        node.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, status: "success" } } : n,
        ),
      );
    } catch (e) {
      setNodes((node) =>
        node.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, status: "error" } } : n,
        ),
      );
    }
  };

  return (
    <WorkflowNode
      name={name}
      description={description}
      onDelete={handleDelete}
      onSettings={onSettings}
    >
      <NodeStatusIndicator
        status={status}
        variant="border"
        className="rounded-l-2xl"
      >
        <button
          onClick={handleTrigger}
          className="bg-primary/10 absolute -right-2 p-1 rounded-r-full hover:translate-x-2 transition-all"
        >
          <ZapIcon className="stroke-1 size-2 " />{" "}
        </button>
        <BaseNode
          status={status}
          onDoubleClick={onDoubleClick}
          className="rounded-l-2xl relative group"
        >
          <BaseNodeContent>
            {typeof Icon == "string" ? (
              <Image alt={name} src={Icon} width={16} height={16} />
            ) : (
              <>
                <Icon className="size-4 text-muted-foreground" />
              </>
            )}
            {children}
            {/*<BaseHandle id="target-1" type="target" position={Position.Left} />*/}
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
};

BaseTriggerNode.displayName = "BaseTriggerNode";
