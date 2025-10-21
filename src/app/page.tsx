import { requireAuth } from "@/auth-utils";
import { caller } from "@/trpc/server";

export default async function Home() {
  const session = await caller.getUser();

  return (
    <div>
      <pre>{JSON.stringify(session, 0, 2)}</pre>
    </div>
  );
}
