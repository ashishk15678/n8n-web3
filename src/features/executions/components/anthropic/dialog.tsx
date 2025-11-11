"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const AVAILABLE_MODELS = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-1106",
  "gpt-4",
  "gpt-4-0613",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(
      /^[A-Za-z_$][A-Za-z0-9_$]*$/,
      "Variable name must start with a letter or underscore and contain only numbers, letters and underscores",
    ),
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export type AnthropicReqestFormValues = z.infer<typeof formSchema>;

interface AnthropicRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<AnthropicReqestFormValues>;
}

export const AnthropicRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: AnthropicRequestDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      // model: defaultValues.model || AVAILABLE_MODELS[0],
      userPrompt: defaultValues.userPrompt || "",
      systemPrompt: defaultValues.systemPrompt || "",
    },
  });

  const watchVariableName = form.watch("variableName") || "myApiCall";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anthropic</DialogTitle>
          <DialogDescription>Configure the ai model.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-8 mt-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              name="variableName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable name</FormLabel>

                  <FormControl>
                    <Input {...field} placeholder="myApiCall" />
                  </FormControl>

                  <FormDescription>
                    Use this name to reference the result in other nodes :{" "}
                    {`{{${watchVariableName}  .data}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*
            <FormField
              name="model"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger {...field} className="w-full">
                        {" "}
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}{" "}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormDescription>
                    Model to be used for the below work.{" "}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />*/}
            <FormField
              name="systemPrompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt {"{optional}"} </FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      className="font-mono text-sm min-h-[80px]"
                      placeholder="You are a helpful ai assistant"
                    />
                  </FormControl>

                  <FormDescription>
                    Sets the behaviour of the assistant , you can use{" "}
                    {"{{ variables }}"} here or use{" "}
                    {"{{json object-to-stringify}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="userPrompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt </FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      className="font-mono text-sm min-h-[80px]"
                      placeholder="Summarise this long paragraph"
                    />
                  </FormControl>

                  <FormDescription>
                    Actual work that the ai assistant will do.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
