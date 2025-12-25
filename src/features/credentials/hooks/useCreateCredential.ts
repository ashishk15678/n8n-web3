import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialParams } from "./use-credential-params";
import { CredentialType } from "@/generated/prisma";

export function useCredentials() {
  const trpc = useTRPC();
  return useQuery(trpc.credentials.getMany.queryOptions({}));
}

export function useRemoveCredential() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({}),
        );
        toast.success("Credential successfully removed.");
      },
      onError: (ctx) =>
        toast.error(`Credential was not removed : ${ctx.message}`),
    }),
  );
}

export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialParams();

  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

export const useCreateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(`Credential ${data.name} succesfully created`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({}),
        );
      },
      onError: (data: any) => {
        toast.error(`Failed to create Credential : ${data.message}`);
      },
    }),
  );
};

export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data: any) => {
        toast.success(`Credential ${data.name} succesfully saved.`);
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({}),
        );
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (data: any) => {
        toast.error(`Failed to save credential : ${data.message}`);
      },
    }),
  );
};

export const useCredentialByType = (type: CredentialType) => {
  const trpc = useTRPC();
  return useQuery(trpc.credentials.getByType.queryOptions({ type }));
};
