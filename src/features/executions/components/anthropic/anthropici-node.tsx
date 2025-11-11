"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "../../base-execution-node";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { GeminiChannel } from "@/inngest/channels/gemini";
import { fetchAnthropicRealtimeToken } from "./actions";
import { AnthropicReqestFormValues, AnthropicRequestDialog } from "./dialog";

export type AnthropicNodeData = {
  variableName: string;
  model:
    | "gpt-3.5-turbo"
    | "gpt-3.5-turbo-0125"
    | "gpt-3.5-turbo-1106"
    | "gpt-4"
    | "gpt-4-0613";
  systemPrompt?: string;
  userPrompt: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const [isOpen, setOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GeminiChannel().name,
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });
  const handleSubmit = (values: AnthropicReqestFormValues) => {
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
      <AnthropicRequestDialog
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

AnthropicNode.displayName = "AnthropicNode";
