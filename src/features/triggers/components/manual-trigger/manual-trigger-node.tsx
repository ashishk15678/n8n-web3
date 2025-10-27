import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { NodeStatus } from "@/components/reactflow/node-status-indicator";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ManualTriggerDialog open={open} onOpenChange={setOpen} />
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="Execute Workflow"
        description="When clicking 'Execute Workflow'"
        status={"initial"}
        onDoubleClick={() => setOpen(true)}
        onSettings={() => setOpen(true)}
      ></BaseTriggerNode>
    </>
  );
});
