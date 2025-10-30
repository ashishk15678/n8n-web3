import { CredentialCreateDialog } from ".";
import { useCreateCredential } from "../hooks/useCreateCredential";

export function CreateCredentialButton() {
  return (
    <div>
      <CredentialCreateDialog />
    </div>
  );
}
