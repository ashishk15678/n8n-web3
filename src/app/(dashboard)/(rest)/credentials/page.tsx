import { requireAuth } from "@/auth-utils";
import { CredentialList } from "@/features/credentials/components";
import { CreateCredentialButton } from "@/features/credentials/components/create-credential-button";

export default async function Page() {
  await requireAuth();
  return (
    <div className="w-full">
      <CreateCredentialButton />
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <CredentialList />
        </div>
      </div>
    </div>
  );
}
