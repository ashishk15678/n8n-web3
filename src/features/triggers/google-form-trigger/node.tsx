import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { BaseTriggerNode } from "../components/base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { fetchGoogleFormTriggerRealtimeToken } from "./actions";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
  const [open, setOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: googleFormTriggerChannel().name,
    topic: "status",
    refreshToken: fetchGoogleFormTriggerRealtimeToken,
  });

  return (
    <>
      <GoogleFormTriggerDialog open={open} onOpenChange={setOpen} />
      <BaseTriggerNode
        {...props}
        onTrigger={() => {
          toast.success(`Workflow started`);
        }}
        icon={"/Google_Forms_Logo.svg"}
        name="Form submission"
        showTrigger={false}
        status={nodeStatus}
        onDoubleClick={() => setOpen(true)}
        onSettings={() => setOpen(true)}
      ></BaseTriggerNode>
    </>
  );
});

// export function setNode({
//   id,
//   data,
//   setNodes,
// }: {
//   id: string;
//   data: Node;
//   setNodes: (nodes: Node[]) => Node[];
// }) {
//   setNodes((nodes: Node[]) =>
//     nodes.map((node: Node) => {
//       if (node.id == id) {
//         return {
//           ...node,
//           data: {
//             ...node.data,
//             data,
//           },
//         };
//       }
//       return node;
//     }),
//   );
// }
