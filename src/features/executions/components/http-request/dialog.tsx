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
import { useEffect } from "react";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(
      /^[A-Za-z_$][A-Za-z0-9_$]*$/,
      "Variable name must start with a letter or underscore and contain only numbers, letters and underscores",
    ),
  endpoint: z.url({ message: "Please enter a valid url." }),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]),
  body: z.string().optional(),
});

export type HttpReqestFormValues = z.infer<typeof formSchema>;

interface HttpRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<HttpReqestFormValues>;
}

export const HttpRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: HttpRequestDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      endpoint: defaultValues.endpoint || "",
      body: defaultValues.body || "",
      method: defaultValues.method || "GET",
    },
  });

  // useEffect(() => {
  //   if (open) {
  //     form.reset({
  //       variableName: defaultValues.variableName || "",
  //       endPoint: defaultValues.endPoint || "",
  //       body: defaultValues.body || "",
  //       method: defaultValues.method || "GET",
  //     });
  //   }
  // }, [open, defaultValues, form]);

  const watchMethod = form.watch("method");
  const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod);
  const watchVariableName = form.watch("variableName") || "myApiCall";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Trigger</DialogTitle>
          <DialogDescription>
            Configure settings for HTTP Request Node.
          </DialogDescription>
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
                    {`{{${watchVariableName}.response.data}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="method"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full ">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The HTTP method for this request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="endpoint"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                    />
                  </FormControl>

                  <FormDescription>
                    The HTTP endpoint for this request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showBodyField && (
              <FormField
                name="body"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        className="font-mono text-sm"
                        placeholder='{\n
                        data:{name:"random-guy"}}'
                      />
                    </FormControl>

                    <FormDescription>
                      The Body for this request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
