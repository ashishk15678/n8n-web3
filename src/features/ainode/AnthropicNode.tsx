import { NodeProps } from "@xyflow/react";
import { AINode } from "./node";
import { useCredentials } from "../credentials/hooks/useCreateCredential";
import { TRPCError } from "@trpc/server";

export const AnthropicAiNode = ({
  ...props
}: NodeProps & {
  onTrigger?: (result: { text?: string; error?: string }) => void;
}) => {
  const credentials = useCredentials().data;
  const DEFAULT_CREDENTIAL = "Anthropic_API_KEY";

  const credential =
    credentials !== undefined &&
    credentials.items.filter((c) => c.name == DEFAULT_CREDENTIAL);
  return (
    <AINode
      id={props.id}
      props={props}
      status="initial"
      from="ANTHROPIC"
      image="/anthropic.png"
      models={[
        { name: "claude-3-5-sonnet" },
        { name: "claude-3-5-haiku" },
        { name: "claude-3-opus" },
      ]}
      onTrigger={(props as any).onTrigger}
    />
  );
};
