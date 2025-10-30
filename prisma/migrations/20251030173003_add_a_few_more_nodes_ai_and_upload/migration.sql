-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'TIMED_TRIGGER';
ALTER TYPE "NodeType" ADD VALUE 'HTTP_API';
ALTER TYPE "NodeType" ADD VALUE 'UPLOAD_IMAGE';
ALTER TYPE "NodeType" ADD VALUE 'UPLOAD_VIDEO';
ALTER TYPE "NodeType" ADD VALUE 'UPLOAD_PDF';
ALTER TYPE "NodeType" ADD VALUE 'UPLOAD_TEXT';
ALTER TYPE "NodeType" ADD VALUE 'UPLOAD_ALL';
