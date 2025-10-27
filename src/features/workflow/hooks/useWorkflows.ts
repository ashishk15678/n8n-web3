import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowParams } from "./useWorkflowParams";

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowParams();

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};

export const useCreateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(`Workflow ${data.name} succesfully created`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
      onError: (data: any) => {
        toast.error(`Failed to create workflow : ${data.message}`);
      },
    }),
  );
};

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(`Succesfully deleted the workflow : ${data.name}`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({ id: data.id }),
        );
      },
      onError: (data: any) => {
        toast.error(`Failed to create workflow : ${data.message}`);
      },
    }),
  );
};

export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
};

export const useUpdateWorkflowName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(`Workflow ${data.name} succesfully updated`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (data: any) => {
        toast.error(`Failed to update workflow : ${data.message}`);
      },
    }),
  );
};

export const useUpdateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(`Workflow ${data.name} succesfully saved.`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (data: any) => {
        toast.error(`Failed to save workflow : ${data.message}`);
      },
    }),
  );
};
