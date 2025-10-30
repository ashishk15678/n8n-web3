import ManualUploadBaseNode from "./manual-upload-base";

import { NodeProps } from "@xyflow/react";

export function PdfUploadNode({ ...props }: NodeProps) {
  return (
    <ManualUploadBaseNode
      status="initial"
      onSubmit={() => {}}
      accept="pdf"
      {...props}
    />
  );
}

export function ImageUploadNode({ ...props }: NodeProps) {
  return (
    <ManualUploadBaseNode
      status="initial"
      onSubmit={() => {}}
      accept="image"
      {...props}
    />
  );
}

export function VideoUploadNode({ ...props }: NodeProps) {
  return (
    <ManualUploadBaseNode
      status="initial"
      onSubmit={() => {}}
      accept="video"
      {...props}
    />
  );
}

export function TextUploadNode({ ...props }: NodeProps) {
  return (
    <ManualUploadBaseNode
      status="initial"
      onSubmit={() => {}}
      accept="text"
      {...props}
    />
  );
}

export function AllUploadNode({ ...props }: NodeProps) {
  return (
    <ManualUploadBaseNode
      status="initial"
      onSubmit={() => {}}
      accept="all"
      {...props}
    />
  );
}
