import { cache } from "react";
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { polarClient } from "@/lib/polar";
import superjson from "superjson";
export const createTrpcContext = cache(async () => {
  return { userId: 1223 };
});

const t = initTRPC.create({
  transformer: superjson,
});

export const createTrpcRouter = t.router;
export const baseProcedure = t.procedure;
export const factory = t.createCallerFactory;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      cause: "Unauthorized user",
      message: "User must be authorized to invoke this functionality",
    });

  return next({ ctx: { ...ctx, auth: await session } });
});

export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });
    if (
      !customer.activeSubscriptions ||
      customer.activeSubscriptions.length == 0
    )
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Active subscription required.",
      });
    return next({ ctx: { ...ctx, customer } });
  },
);
