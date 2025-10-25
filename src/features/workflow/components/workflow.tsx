"use client";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/useWorkflows";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "./entity-components";
import { useRouter } from "next/navigation";
import { useWorkflowParams } from "../hooks/useWorkflowParams";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { Button } from "@/components/ui/button";
import type { Workflow } from "@/generated/prisma";
import { WorkflowIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const WorkFlowsList = () => {
  const workflow = useSuspenseWorkflows();
  return (
    <EntityList
      items={workflow.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkFlowItem data={workflow} />}
      emptyView={<WorkFlowsEmpty />}
    />
  );
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
      // @ts-ignore
      totalPages={workflows.data.totalPages}
      // @ts-ignore
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

export const WorkFlowsLoading = () => {
  return <LoadingView entity="workflows" />;
};
export const WorkFlowsError = () => {
  return <ErrorView message="Error loading workflows !" />;
};

export const WorkFlowsEmpty = () => {
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: handleError,
      onSuccess: (data) => router.push(`/workflows/${data.id}`),
    });
  };

  return (
    <>
      {modal}
      <EmptyView
        message="You have not created any new workflows. Get started by creating your first workflow."
        onNew={handleCreate}
      />
    </>
  );
};

export const WorkFlowItem = ({ data }: { data: Workflow }) => {
  const removeWorkFlow = useRemoveWorkflow();

  const handleRemove = () => {
    removeWorkFlow.mutate({
      id: data.id,
    });
  };

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          <p className="text-muted-foreground text-xs">
            Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
            &bull; Created{" "}
            {formatDistanceToNow(data.createdAt, { addSuffix: true })} {""}
          </p>
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          {" "}
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={false}
    />
  );
};
