import { requireAuth } from "@/auth-utils";
import { CredentialList } from "@/features/credentials/components";
import { CreateCredentialButton } from "@/features/credentials/components/create-credential-button";
import { CredentialsParamsLoader } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  await requireAuth();

  const params = await CredentialsParamsLoader(searchParams);
  prefetchCredentials(params);

  return (
    <HydrateClient>
      <Suspense fallback={<>Loading...</>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <div className="w-full">
            <CreateCredentialButton />
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm">
                <CredentialList />
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
