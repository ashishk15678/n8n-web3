export default async function Page({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  return <div>Workflow id : {workflowId}</div>;
}
