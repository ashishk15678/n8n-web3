import { NodeProps } from "@xyflow/react";
import { AINode } from "./node";

export const GoogleAiNode = ({
  ...props
}: NodeProps & {
  onTrigger?: (result: { text?: string; error?: string }) => void;
}) => (
  <AINode
    id={props.id}
    props={props}
    status="initial"
    from="GOOGLE"
    image="/google.svg"
    models={[
      { name: "gemini-1.5-flash" },
      { name: "gemini-1.5-pro" },
      { name: "gemini-2.0-flash" },
      { name: "gemini-2.0-flash-lite" },
      { name: "gemini-exp-1206" },
    ]}
    onTrigger={(props as any).onTrigger}
  />
);
