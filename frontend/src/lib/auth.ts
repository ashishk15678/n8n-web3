import { betterAuth, User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";
import { createAuthClient } from "better-auth/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
});

export async function ServerAuth(
  request: Request
): Promise<User | NextResponse> {
  if (!request) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        issue: "invalid headers , maybe try re-logging in",
      },
      { status: 401 }
    );
  }

  const user = await (async () => {
    const data = await auth.api.getSession({
      headers: request.headers,
    });
    if (data instanceof NextResponse) {
      return data;
    }
    return data?.user;
  })();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }
  return await user;
}
