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
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

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
      renderItem={(data) => (
        <EntityItem
          title={data.name}
          subtitle={data.value}
          image={<KeyIcon className="size-4" />}
          href="#"
        />
      )}
    />
  );
}

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  type: z
    .enum([
      CredentialType.API_KEY,
      CredentialType.BOT_KEY,
      CredentialType.OAUTH,
    ])
    .optional(),
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
                        API KEY
                      </SelectItem>

                      <SelectItem value={CredentialType.BOT_KEY}>
                        BOT KEY
                      </SelectItem>

                      <SelectItem value={CredentialType.OAUTH}>
                        OAUTH KEY
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
