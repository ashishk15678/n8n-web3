import { requireUnAuth } from "@/auth-utils";
import LoginForm from "@/components/custom/login-form";

export default async function Page() {
  await requireUnAuth();
  return (
    <div className=" p-1 flex bg-muted items-center justify-center h-screen w-full">
      <div className="max-w-md w-full">
        <LoginForm />
      </div>
    </div>
  );
}
