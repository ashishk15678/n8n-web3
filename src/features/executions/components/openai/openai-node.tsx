"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "../../base-execution-node";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenaiRealtimeToken } from "./actions";
import { OpenaiReqestFormValues, OpenaiRequestDialog } from "./dialog";
import { openaiChannel } from "@/inngest/channels/openai";

export type OpenaiNodeData = {
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

type OpenaiNodeType = Node<OpenaiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenaiNodeType>) => {
  const [isOpen, setOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: openaiChannel().name,
    topic: "status",
    refreshToken: fetchOpenaiRealtimeToken,
  });
  const handleSubmit = (values: OpenaiReqestFormValues) => {
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
    ? `gpt-4 ${nodeData.variableName}`
    : "Not configured.";
  return (
    <>
      <OpenaiRequestDialog
        open={isOpen}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        id={props.id}
        icon={"/openai.svg"}
        name="Openai node"
        description={description}
        onSettings={() => setOpen(true)}
        onDoubleClick={() => setOpen(true)}
      />
    </>
  );
});

OpenAiNode.displayName = "OpenaiNode";
