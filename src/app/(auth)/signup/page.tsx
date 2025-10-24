import { requireUnAuth } from "@/auth-utils";
import RegisterForm from "@/components/custom/register-form";

export default async function Page() {
  await requireUnAuth();
  return (
    <div className=" p-1 bg-muted flex items-center justify-center h-screen w-full">
      <div className="max-w-md w-full">
        <RegisterForm />
      </div>
    </div>
  );
}
