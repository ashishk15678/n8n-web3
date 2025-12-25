-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CredentialType" ADD VALUE 'OPENAI';
ALTER TYPE "CredentialType" ADD VALUE 'GEMINI';
ALTER TYPE "CredentialType" ADD VALUE 'ANTHROPIC';

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "credentialId" TEXT;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
