import { requireAuth } from "@/auth-utils";

export default async function Page({
  params,
}: {
  params: Promise<{ executionId: string }>;
}) {
  const param = (await params).executionId;

  await requireAuth();
  return <div>Execution id : {param}</div>;
}
