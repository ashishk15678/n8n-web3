export default async function Page({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  await requireAuth();
  const param = (await params).credentialId;
  return <div>Credentials id : {param}</div>;
}
