import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/login?msg=please+login+to+continue`);
  return session;
};

export const requireUnAuth = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(`/workflows?msg=already+logged+in`);
  return session;
};
