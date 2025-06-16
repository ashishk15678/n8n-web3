import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  handleApiError,
  requireAuth,
  notFound,
  validationError,
  ApiError,
  HTTP_STATUS,
  ERROR_CODES,
} from "@/lib/api-error";

// GET /api/projects - Get all projects for a user
export async function GET(request: Request) {
  try {
    const session = await requireAuth(request);

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    if (!body.name) {
      validationError("Project name is required");
    }

    const project = await prisma.project.create({
      data: {
        name: body.name,
        userId: session.user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      validationError("Project ID is required");
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      notFound("Project not found");
      return;
    }

    if (project.userId !== session.user.id) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You don't have permission to delete this project",
        ERROR_CODES.INSUFFICIENT_PERMISSIONS
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
