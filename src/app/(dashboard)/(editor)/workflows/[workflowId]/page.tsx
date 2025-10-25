import {
  Editor,
  EditorError,
  EditorHeader,
  EditorLoading,
} from "@/features/editor/components/editor";

import { prefetchWorkFlow } from "@/features/workflow/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "@sentry/nextjs";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  prefetchWorkFlow(workflowId);
  return (
    <div>
      <HydrateClient>
        <ErrorBoundary fallback={<EditorError />}>
          <Suspense fallback={<EditorLoading />}>
            <EditorHeader workflowId={workflowId} />
            <main className="flex flex-1">
              <Editor workflowId={workflowId} />
            </main>
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </div>
  );
}
