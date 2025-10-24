import { requireAuth } from "@/auth-utils";

export default async function Page() {
  await requireAuth();
  return <div>Executions</div>;
}
