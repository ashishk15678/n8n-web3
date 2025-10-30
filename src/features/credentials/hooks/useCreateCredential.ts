import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export function useCreateCredential() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({}),
        );
        toast.success("Credential successfully created");
      },
      onError: (ctx) =>
        toast.error(`Credential was not created : ${ctx.message}`),
    }),
  );
}

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
