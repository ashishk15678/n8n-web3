import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { NodeStatus } from "@/components/reactflow/node-status-indicator";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { editorAtom } from "@/features/editor/store/atom";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [open, setOpen] = useState(false);
  const { getNode } = useReactFlow();
  const node = getNode(props.id);

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
        status={props.data.status || "initial"}
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
    })
  );
}
