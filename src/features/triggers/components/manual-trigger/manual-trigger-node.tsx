import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { NodeStatus } from "@/components/reactflow/node-status-indicator";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { editorAtom } from "@/features/editor/store/atom";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { fetchManualTriggerRealtimeToken } from "./actions";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [open, setOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: manualTriggerChannel().name,
    topic: "status",
    refreshToken: fetchManualTriggerRealtimeToken,
  });

  return (
    <>
      <ManualTriggerDialog open={open} onOpenChange={setOpen} />
      <BaseTriggerNode
        {...props}
        onTrigger={() => {
          toast.success(`Workflow started`);
        }}
        icon={MousePointerIcon}
        name="Execute Workflow"
        description="When clicking 'Execute Workflow'"
        status={nodeStatus}
        onDoubleClick={() => setOpen(true)}
        onSettings={() => setOpen(true)}
      ></BaseTriggerNode>
    </>
  );
});

export function setNode({
  id,
  data,
  setNodes,
}: {
  id: string;
  data: Node;
  setNodes: (nodes: Node[]) => Node[];
}) {
  setNodes((nodes: Node[]) =>
    nodes.map((node: Node) => {
      if (node.id == id) {
        return {
          ...node,
          data: {
            ...node.data,
            data,
          },
        };
      }
      return node;
    }),
  );
}
