import { prisma } from "@/lib/db";
import { User } from "@/generated/prisma";
import { tryCatch, validateRequired } from "@/lib/api-utils";
import { auth, ServerAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET /api/users/:id - Get a specific user
export const GET = tryCatch(async (request: Request) => {
  const authUser = await ServerAuth(request);
  if (authUser instanceof NextResponse) {
    return authUser;
  }

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      projects: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}, "Failed to fetch user");

// POST /api/users - Create a new user
export const POST = tryCatch(async (request: Request) => {
  const userData: User = await request.json();
  validateRequired(userData, ["email", "name"]);

  const newUser = await prisma.user.create({
    data: userData,
  });

  return newUser;
}, "Failed to create user");
