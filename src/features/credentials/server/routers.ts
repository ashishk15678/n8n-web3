import { NON_PREMIUM_LIMIT, PAGINATION } from "@/config/constants";
import { CredentialType, EnvironmentType } from "@/generated/prisma";
import prisma from "@/lib/db";
import { createTrpcRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const CredentialsRouter = createTrpcRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1),
        isDisabled: z.boolean().default(true),
        environment: z
          .enum([EnvironmentType.DEVELOPMENT, EnvironmentType.PRODUCTION])
          .default(EnvironmentType.DEVELOPMENT)
          .optional(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { name, value, type, isDisabled, environment },
      }) => {
        const credentialsCount = await prisma.credential.count({
          where: {
            userId: ctx.auth.user.id,
          },
        });

        if (credentialsCount >= NON_PREMIUM_LIMIT.MAX_CREDENTIALS)
          throw new TRPCError({
            message: `Non premium users cannot create more than ${NON_PREMIUM_LIMIT.MAX_CREDENTIALS} credentials.`,
            code: "FORBIDDEN",
          });
        return prisma.credential.create({
          data: {
            userId: ctx.auth.user.id,
            name,
            value, // TODO : secure api key
            type,
            isDisabled,
            environment,
          },
        });
      },
    ),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      return prisma.credential.delete({
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
        name: z.string(),
        type: z.enum(CredentialType),
        value: z.string().min(1),
        isDisabled: z.boolean().default(true),
        environment: z
          .enum([EnvironmentType.DEVELOPMENT, EnvironmentType.PRODUCTION])
          .default(EnvironmentType.DEVELOPMENT)
          .optional(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { id, name, type, value, isDisabled, environment },
      }) => {
        const credential = await prisma.credential.findUniqueOrThrow({
          where: { id, userId: ctx.auth.user.id },
        });

        return await prisma.credential.update({
          where: { id },
          data: {
            name,
            type,
            value,
            isDisabled,
            environment,
          },
        });
      },
    ),

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
      return prisma.credential.findUniqueOrThrow({
        where: { id, userId: ctx.auth.user.id },
      });
    }),

  getByType: protectedProcedure
    .input(z.object({ type: z.enum(CredentialType) }))
    .query(async ({ ctx, input: { type } }) => {
      return prisma.credential.findMany({
        where: { type, userId: ctx.auth.user.id },
      });
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
      const [raw_items, totalCount] = await Promise.all([
        prisma.credential.findMany({
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
        prisma.credential.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const items = raw_items.map((item) => ({
        ...item,
        value: `${item.value.substring(0, 3)}...${item.value.substring(item.value.length - 3, item.value.length)}`,
      }));
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
