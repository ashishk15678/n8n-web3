import { cache } from "react";
import { initTRPC } from "@trpc/server";
export const createTrpcContext = cache(async () => {
  return { userId: 1223 };
});

const t = initTRPC.create({});

export const createTrpcRouter = t.router;
export const baseProcedure = t.procedure;
export const factory = t.createCallerFactory;
