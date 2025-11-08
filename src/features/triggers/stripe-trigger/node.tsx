import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { toast } from "sonner";
import { BaseTriggerNode } from "../components/base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchStripeTriggerRealtimeToken } from "./actions";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

export const StripeTriggerNode = memo((props: NodeProps) => {
  const [open, setOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: stripeTriggerChannel().name,
    topic: "status",
    refreshToken: fetchStripeTriggerRealtimeToken,
  });

  return (
    <>
      <StripeTriggerDialog open={open} onOpenChange={setOpen} />
      <BaseTriggerNode
        {...props}
        onTrigger={() => {
          toast.success(`Workflow started`);
        }}
        icon={"/stripe.svg"}
        name="Stripe trigger"
        description="When stripe event is captured."
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
