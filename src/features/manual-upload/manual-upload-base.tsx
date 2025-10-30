"use client";

import { BaseHandle } from "@/components/reactflow/base-handle";
import { BaseNode } from "@/components/reactflow/base-node";
import { NodeStatus } from "@/components/reactflow/node-status-indicator";
import { NodeProps, Position } from "@xyflow/react";
import { InputHTMLAttributes } from "react";

interface ManualUploadBaseNodeProps extends NodeProps {
  status: NodeStatus;
  onSubmit?: () => void;
  accept: "image" | "video" | "pdf" | "text" | "other" | "all";
  multiple?: boolean;
}

const formats = {
  image: "jpeg png jpg svg",
  video: "mp4 mkv webm",
  pdf: "application/pdf",
  text: "txt",
  other: "",
  all: "",
};

export default function ManualUploadBaseNode({
  multiple = false,
  ...props
}: ManualUploadBaseNodeProps) {
  return (
    <BaseNode {...props} status={props.status as NodeStatus}>
      <input
        type="file"
        accept={formats[props.accept]}
        className=""
        multiple={multiple}
      />
      <BaseHandle
        type="source"
        id={`${props.accept}-provider`}
        position={Position.Right}
      />
    </BaseNode>
  );
}
