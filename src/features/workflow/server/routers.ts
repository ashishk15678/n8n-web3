import { NON_PREMIUM_LIMIT, PAGINATION } from "@/config/constants";
import { NodeType } from "@/generated/prisma";
import prisma from "@/lib/db";
import {
  createTrpcRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import type { Edge, Node } from "@xyflow/react";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/utils";

export const WorkFlowsRouter = createTrpcRouter({
  execute: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const workflow = prisma.workflow.findUniqueOrThrow({
        where: {
          userId: ctx.auth.user.id,
          id,
        },
      });

      await sendWorkflowExecution({ workflowId: id });

      return workflow;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const workflows = await prisma.workflow.count();
    if (workflows > NON_PREMIUM_LIMIT.MAX_WORKFLOWS) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `needs to have premium to create more than ${NON_PREMIUM_LIMIT.MAX_WORKFLOWS} workflows.`,
      });
    }
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,
        nodes: {
          createMany: {
            data: [
              {
                type: NodeType.INITIAL,
                position: { x: 0, y: 0 },
                name: NodeType.INITIAL,
              },
              {
                type: NodeType.INITIAL,
                position: { x: 100, y: 200 },
                name: NodeType.INITIAL,
              },
            ],
          },
        },
      },
    });
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      return prisma.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any().optional()),
          }),
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input: { id, nodes, edges } }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id, userId: ctx.auth.user.id },
      });

      return await prisma.$transaction(async (tx) => {
        await tx.node.deleteMany({ where: { workflowId: id } });
        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            workflowId: id,
            name: node.type || "unknown",
            type: node.type as NodeType,
            position: node.position,
            data: node.data || {},
          })),
        });

        await tx.connection.createMany({
          data: edges.map((edge) => ({
            workflowId: id,
            fromNodeId: edge.source,
            toNodeId: edge.target,
            fromOutput: edge.sourceHandle || "main",
            toInput: edge.targetHandle || "main",
          })),
        });

        await tx.workflow.updateMany({
          where: { id },
          data: {
            updatedAt: new Date(),
          },
        });
        return workflow;
      });
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), newName: z.string().min(1) }))
    .mutation(({ ctx, input: { id, newName } }) => {
      return prisma.workflow.update({
        where: {
          id: id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: newName,
        },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input: { id } }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: id,
          userId: ctx.auth.user.id,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));

      const edges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return { ...workflow, nodes, edges };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input: { page, pageSize, search } }) => {
      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.workflow.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        totalCount,
      };
    }),
});
