-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "data" JSONB[],
ADD COLUMN     "edges" JSONB[],
ADD COLUMN     "nodes" JSONB[];
