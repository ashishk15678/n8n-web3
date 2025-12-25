"use client";

import {
  EmptyView,
  EntityItem,
  EntityList,
} from "@/features/workflow/components/entity-components";
import {
  useCreateCredential,
  useCredentials,
  useRemoveCredential,
  useSuspenseCredential,
  useSuspenseCredentials,
} from "../hooks/useCreateCredential";
import { KeyIcon, PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import z from "zod";
import { CredentialType, EnvironmentType } from "@/generated/prisma";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import {
  EntityContainer,
  EntityHeader,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "../../workflow/components/entity-components";

import { useRouter } from "next/navigation";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Credential } from "@/generated/prisma";
import {} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCredentialParams } from "../hooks/use-credential-params";

export function CredentialList() {
  const { data } = useCredentials();
  if (!data) return <EmptyView message="Empty credentials" onNew={() => {}} />;

  const handleRemove = () => {
    const remove = useRemoveCredential();
    remove.mutateAsync;
  };
  return (
    <EntityList
      items={data.items}
      renderItem={(data) => <CredentialItem data={data} />}
    />
  );
}

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  type: z.enum([
    CredentialType.API_KEY,
    CredentialType.BOT_KEY,
    CredentialType.OAUTH,
  ]),
  // .optional(),
  isDisabled: z.boolean(),
  environment: z
    .enum([EnvironmentType.DEVELOPMENT, EnvironmentType.PRODUCTION])
    .optional(),
});

export function CredentialCreateDialog() {
  const createClient = useCreateCredential();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "",
      type: "API_KEY",
      isDisabled: false,
      environment: "DEVELOPMENT",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    createClient.mutateAsync({
      ...values,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={createClient.isPending}>
          Create <PlusIcon className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Create your Credential</DialogTitle>
        <DialogDescription>Keep your secrets , well secret</DialogDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of the key</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Google gemini api key" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="value"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value of the key</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="SK_1234_QWST" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of key</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="What is the type of key ?"></SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={CredentialType.API_KEY}>
                        Api key
                      </SelectItem>

                      <SelectItem value={CredentialType.BOT_KEY}>
                        Bot key
                      </SelectItem>

                      <SelectItem value={CredentialType.OAUTH}>
                        Oauth key
                      </SelectItem>

                      <SelectItem value={CredentialType.GEMINI}>
                        Gemini
                      </SelectItem>

                      <SelectItem value={CredentialType.OPENAI}>
                        Openai
                      </SelectItem>

                      <SelectItem value={CredentialType.ANTHROPIC}>
                        Anthropic
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="isDisabled"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row justify-between">
                  <FormLabel>Is the key disabled ?</FormLabel>
                  <FormControl>
                    <Checkbox
                      className="size-6"
                      {...field}
                      onCheckedChange={(v) =>
                        v.valueOf() == true
                          ? field.onChange(true)
                          : field.onChange(false)
                      }
                      value={field.value == true ? 1 : 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="environment"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environment type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Environment type :"></SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EnvironmentType.DEVELOPMENT}>
                        Development
                      </SelectItem>

                      <SelectItem value={EnvironmentType.PRODUCTION}>
                        Production
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createClient.isPending && createClient.isPaused}
            >
              Save{" "}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();
  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createcredential = useCreateCredential();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  // const handleCreate = () => {
  //   createcredential.mutate(undefined, {
  //     onError: (error) => handleError(error),
  //     onSuccess: (data: any) => router.push(`/credentials/${data.id}`),
  //   });
  // };

  return (
    <>
      {modal}
      <EntityHeader
        title="credentials"
        description="Create and manage your credentials"
        // onNew={handleCreate}
        newButtonLabel="New credential"
        disabled={false}
        isCreating={false}
      />
    </>
  );
};

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialParams();
  return (
    <EntityPagination
      disabled={credentials.isFetching}
      // @ts-ignore
      totalPages={credentials.data.totalPages}
      // @ts-ignore
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <EntityContainer
        header={<CredentialsHeader />}
        search={<CredentialsSearch />}
        pagination={<CredentialsPagination />}
      >
        {children}
      </EntityContainer>
    </>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView entity="credentials" />;
};
export const credentialsError = () => {
  return <ErrorView message="Error loading credentials !" />;
};

export const CredentialsEmpty = () => {
  const createcredential = useCreateCredential();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();
  // const handleCreate = (values) => {
  //   createcredential.mutate(values, {
  //     onError: handleError,
  //     onSuccess: (data) => router.push(`/credentials/${data.id}`),
  //   });
  // };

  return (
    <>
      {modal}
      <EmptyView
        message="You have not created any new credentials. Get started by creating your first credential."
        // onNew={() => }
      />
    </>
  );
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removecredential = useRemoveCredential();

  const handleRemove = () => {
    removecredential.mutate({
      id: data.id,
    });
  };

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
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
          <KeyIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={false}
    />
  );
};
