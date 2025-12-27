"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { authClient } from "@/auth-client";
import { toast } from "sonner";
import Image from "next/image";

const loginSchema = z.object({
  email: z.email("Please enter valid email."),
  password: z.string().min(1, "Password is required"),
});

type LoginFormType = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormType) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => router.push("/workflows?msg=successfull+logged+in"),
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };
  const isPending = form.formState.isSubmitting;
  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-3xl  bg-gradient-to-br from-card via-card/50 to-card">
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="text-primary"
            >
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <Button
                    variant={"outline"}
                    disabled={isPending}
                    className="flex flex-row justify-between space-x-2 rounded-2xl"
                  >
                    Continue with Github{" "}
                    <Image
                      src={"/github.svg"}
                      alt="github image"
                      width={15}
                      height={15}
                      className="rounded-full "
                    />
                  </Button>

                  <Button
                    variant={"outline"}
                    disabled={isPending}
                    className="flex flex-row justify-between space-x-2 rounded-2xl"
                  >
                    Continue with Google
                    <Image
                      src={"/google.svg"}
                      alt="github image"
                      width={15}
                      height={15}
                      className="rounded-full "
                    />
                  </Button>
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Email : </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="a@email.com"
                          className="rounded-2xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Password : </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="0124-abc"
                          className="rounded-2xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-8 rounded-2xl"
                disabled={isPending}
              >
                Login
              </Button>
              <Link href={"/signup"} className="w-full flex justify-end">
                <Button variant={"link"}>Don&apos;t have an account ?</Button>
              </Link>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
