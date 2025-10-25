import { requireAuth } from "@/auth-utils";
import {
  WorkFlowsContainer,
  WorkFlowsList,
} from "@/features/workflow/components/workflow";
import { workflowsParamsLoader } from "@/features/workflow/server/params-loader";
import { prefetchWorkFlows } from "@/features/workflow/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  await requireAuth();
  const params = await workflowsParamsLoader(searchParams);
  prefetchWorkFlows(params);

  return (
    <WorkFlowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Error!</div>}>
          <Suspense fallback={<>Loading...</>}>
            <WorkFlowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkFlowsContainer>
  );
}
