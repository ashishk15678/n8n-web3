import { NodeProps } from "@xyflow/react";
import { AINode } from "./node";

export const OpenAiNode = ({
  ...props
}: NodeProps & {
  onTrigger?: (result: { text?: string; error?: string }) => void;
}) => (
  <AINode
    id={props.id}
    props={props}
    status="initial"
    from="OPENAI"
    image="/openai.svg"
    models={[
      { name: "gpt-4o" },
      { name: "gpt-4o-mini" },
      { name: "gpt-4.1" },
      { name: "gpt-4.1-mini" },
      { name: "o3" },
      { name: "o3-mini" },
    ]}
    onTrigger={(props as any).onTrigger}
  />
);
