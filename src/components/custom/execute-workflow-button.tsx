import { useExecuteWorkflow } from "@/features/workflow/hooks/useWorkflows";
import { Button } from "../ui/button";
import { FlaskRoundIcon } from "lucide-react";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();
  const handleExecute = () => {
    executeWorkflow.mutate({ id: workflowId });
  };

  return (
    <Button size={"lg"} className="" disabled={false} onClick={handleExecute}>
      <FlaskRoundIcon className="size-4" />
      Execute workflow
    </Button>
  );
};
