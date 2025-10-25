"use client";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/useWorkflows";
import { EntityContainer, EntityHeader } from "./entity-components";
import { useRouter } from "next/navigation";

export const WorkFlowsList = () => {
  const { data } = useSuspenseWorkflows();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export const WorkFlowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => handleError(error),
      onSuccess: (data: any) => router.push(`/workflows/${data.id}`),
    });
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={false}
        isCreating={false}
      />
    </>
  );
};

export const WorkFlowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <EntityContainer
        header={<WorkFlowsHeader />}
        search={<></>}
        pagination={<> </>}
      >
        {children}
      </EntityContainer>
    </>
  );
};
