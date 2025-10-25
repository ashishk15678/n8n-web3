"use client";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/useWorkflows";
import {
  EntityContainer,
  EntityHeader,
  EntityPagination,
  EntitySearch,
} from "./entity-components";
import { useRouter } from "next/navigation";
import { useWorkflowParams } from "../hooks/useWorkflowParams";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Button } from "@/components/ui/button";

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

export const WorkFlowsSearch = () => {
  const [params, setParams] = useWorkflowParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows"
    />
  );
};

export const WorkFlowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowParams();
  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
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
        search={<WorkFlowsSearch />}
        pagination={<WorkFlowsPagination />}
      >
        {children}
      </EntityContainer>
    </>
  );
};
