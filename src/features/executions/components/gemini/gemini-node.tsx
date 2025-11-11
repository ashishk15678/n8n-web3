"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "../../base-execution-node";
import { memo, useState } from "react";
import { GeminiReqestFormValues, GeminiRequestDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { GeminiChannel } from "@/inngest/channels/gemini";
import { fetchGeminiRealtimeToken } from "./actions";

export type GeminiNodeData = {
  variableName: string;
  // model:
  //   | "gemini-1.5-flash"
  //   | "gemini-1.5-flash-8b"
  //   | "gemini-1.5-pro"
  //   | "gemini-1.0-pro"
  //   | "gemini-pro";
  systemPrompt?: string;
  userPrompt: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const [isOpen, setOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GeminiChannel().name,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });
  const handleSubmit = (values: GeminiReqestFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id == props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData.variableName
    ? `gemini-2.0-flash ${nodeData.variableName}`
    : "Not configured.";
  return (
    <>
      <GeminiRequestDialog
        open={isOpen}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        id={props.id}
        icon={"/google.svg"}
        name="Gemini node"
        description={description}
        onSettings={() => setOpen(true)}
        onDoubleClick={() => setOpen(true)}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";
