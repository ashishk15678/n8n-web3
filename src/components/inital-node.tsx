"use client";

import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { PlaceholderNode } from "./reactflow/placeholder-node";
import { PlusIcon } from "lucide-react";
import { WorkflowNode } from "./workflow-node";

export const InitalNode = memo((props: NodeProps) => {
  return (
    <WorkflowNode showToolBar={false}>
      <PlaceholderNode {...props} onClick={() => {}}>
        <div className="flex items-center cursor-pointer justify-center">
          <PlusIcon className="size-4" />
        </div>
      </PlaceholderNode>
    </WorkflowNode>
  );
});

InitalNode.displayName = "InitalNode";
