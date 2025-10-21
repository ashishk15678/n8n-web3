import prisma from "@/lib/db";
import { baseProcedure, createTrpcRouter, protectedProcedure } from "../init";
import { z } from "zod";
export const AppRouter = createTrpcRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;
    return await prisma.user.findMany({ where: { id: userId } });
  }),
});
