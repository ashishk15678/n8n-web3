"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";

export function Client() {
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());
  return <div>Client : {JSON.stringify(users)}</div>;
}
