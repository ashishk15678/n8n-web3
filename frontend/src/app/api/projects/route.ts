import { prisma } from "@/lib/db";
import { Project } from "@/generated/prisma";
import {
  tryCatch,
  createErrorResponse,
  validateRequired,
} from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET /api/projects - Get all projects for a user
export const GET = tryCatch(async (request: Request) => {
  const { searchParams } = new URL(request.url);

  // auth check
  const authUser = (await auth.api.getSession({
    headers: request.headers,
  }))!.user;

  if (!authUser) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const projectId = searchParams.get("projectId");

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    return project;
  }

  const projects = await prisma.project.findMany({
    where: { userId: authUser.id },
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
