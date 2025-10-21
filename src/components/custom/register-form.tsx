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

const registerSchema = z
  .object({
    email: z.email("Please enter valid email."),
    name: z.string().min(3, "Name must atleast be 3 letter long"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password and password should be same",
    path: ["confirmPassword"],
  });

type LoginFormType = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: LoginFormType) => {
    authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => router.push("/"),
        onError: (ctx) => {
          toast.message(ctx.error.message);
        },
      },
    );
  };
  const isPending = form.formState.isSubmitting;
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Get started</CardTitle>
          <CardDescription>Register below</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="text-black">
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <Button variant={"outline"} disabled={isPending}>
                    Continue with Github
                  </Button>
                  <Button variant={"outline"} disabled={isPending}>
                    Continue with Google
                  </Button>
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="a@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name : </FormLabel>{" "}
                      <FormControl>
                        <Input type="name" placeholder="john doe" {...field} />
                      </FormControl>{" "}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="0124-abc"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="0124-abc"
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
                className="w-full mt-8"
                disabled={isPending}
              >
                Register
              </Button>
              <Link href={"/login"} className="w-full justify-end flex">
                <Button variant={"link"}>Login ?</Button>
              </Link>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
