import { WorkFlowsRouter } from "@/features/workflow/server/routers";
import { createTrpcRouter } from "../init";

export const AppRouter = createTrpcRouter({
  workflows: WorkFlowsRouter,
});
