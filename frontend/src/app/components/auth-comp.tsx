"use client";
import { authClient } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const { useSession, signIn } = authClient;
  const router = useRouter();

  if (useSession.get().data?.user) {
    router.push("/projects");
  }

  return (
    <div className="h-screen w-screen grid place-items-center">
      <div className="flex flex-col items-center gap-4 bg-zinc-100 py-12 px-8 rounded-xl ring-1 ring-zinc-200">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <button
          onClick={() => signIn.social({ provider: "github" })}
          className="bg-black text-white px-4 py-2 rounded-md"
        >
          Sign in with Github
        </button>
      </div>
    </div>
  );
}
