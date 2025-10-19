import prisma from "@/lib/db";
import { baseProcedrue, createTrpcRouter } from "../init";
import { z } from "zod";
export const AppRouter = createTrpcRouter({
  getUsers: baseProcedrue.query(async () => await prisma.user.findMany()),
});
