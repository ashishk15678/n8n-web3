import { WorkFlowsRouter } from "@/features/workflow/server/routers";
import { createTrpcRouter } from "../init";
import { CredentialsRouter } from "@/features/credentials/server/routers";

export const AppRouter = createTrpcRouter({
  workflows: WorkFlowsRouter,
  credentials: CredentialsRouter,
});
