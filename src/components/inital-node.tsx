"use client";

import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { PlaceholderNode } from "./reactflow/placeholder-node";
import { PlusIcon } from "lucide-react";
import { WorkflowNode } from "./workflow-node";
import { NodeSelector } from "./node-selector";

export const InitalNode = memo((props: NodeProps) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <NodeSelector open={isOpen} onOpenChange={setOpen}>
      <WorkflowNode showToolBar={false}>
        <PlaceholderNode {...props} onClick={() => setOpen(true)}>
          <div className="flex items-center cursor-pointer justify-center">
            <PlusIcon className="size-4" />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  );
});

InitalNode.displayName = "InitalNode";
