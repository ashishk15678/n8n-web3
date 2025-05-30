import { prisma } from "@/lib/db";
import { User } from "@/generated/prisma";
import { tryCatch, validateRequired } from "@/lib/api-utils";

// GET /api/users/:id - Get a specific user
export const GET = tryCatch(
  async (request: Request, { params }: { params: { id: string } }) => {
    const userId = params.id;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
  "Failed to fetch user"
);

// POST /api/users - Create a new user
export const POST = tryCatch(async (request: Request) => {
  const userData: User = await request.json();
  validateRequired(userData, ["email", "name"]);

  const newUser = await prisma.user.create({
    data: userData,
  });

  return newUser;
}, "Failed to create user");
