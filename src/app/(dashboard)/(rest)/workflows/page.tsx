import { requireAuth } from "@/auth-utils";
import {
  WorkFlowsContainer,
  WorkFlowsList,
} from "@/features/workflow/components/workflow";
import { prefetchWorkFlows } from "@/features/workflow/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
export default async function Page() {
  await requireAuth();

  prefetchWorkFlows();

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
