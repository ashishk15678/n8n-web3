import prisma from "@/lib/db";
import { baseProcedure, createTrpcRouter, protectedProcedure } from "../init";
import { z } from "zod";
import { inngest } from "@/inngest/client";
export const AppRouter = createTrpcRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;
    return await prisma.user.findMany({ where: { id: userId } });
  }),
  getWorkflows: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;
    return await prisma.workflow.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
    });
  }),

  createWorkflow: protectedProcedure.mutation(async ({ ctx }) => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "random@email.com",
      },
    });

    return await prisma.workflow.create({
      data: {
        name: "test-workflow",
        userId: ctx.auth.user.id,
      },
    });
  }),
});
