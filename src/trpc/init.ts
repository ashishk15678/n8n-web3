import { cache } from "react";
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
export const createTrpcContext = cache(async () => {
  return { userId: 1223 };
});

const t = initTRPC.create({});

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
