import { prisma } from "@/lib/db";
import { Project } from "@/generated/prisma";
import {
  tryCatch,
  createErrorResponse,
  validateRequired,
} from "@/lib/api-utils";

// GET /api/projects - Get all projects for a user
export const GET = tryCatch(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    throw new Error("User ID is required");
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      user: true,
    },
  });

  return projects;
}, "Failed to fetch projects");

// POST /api/projects - Create a new project
export const POST = tryCatch(async (request: Request) => {
  const body = await request.json();
  validateRequired(body, ["userId", "project"]);

  const { userId, project } = body;

  const newProject = await prisma.project.create({
    data: {
      ...project,
      user: { connect: { id: userId } },
    },
    include: {
      user: true,
    },
  });

  return newProject;
}, "Failed to create project");
