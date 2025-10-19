import { getQueryClient, trpc } from "@/trpc/server";
import { Client } from "./client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export default async function Home() {
  const queryClient = getQueryClient();
  void (await queryClient.prefetchQuery(trpc.getUsers.queryOptions()));
  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div>Loading....</div>}>
          <Client />{" "}
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
