import { NextRequest, NextResponse } from "next/server";
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

// Helper function to extract projectId from URL
function extractProjectId(request: NextRequest | Request): string {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  return pathParts[3]; // /api/projects/[projectId]/custom-nodes
}

// GET /api/projects/[projectId]/custom-nodes - Get all custom nodes for a project
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const projectId = extractProjectId(request);

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      notFound("Project not found");
    }

    if (project?.userId !== session.user.id) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You don't have permission to access this project",
        ERROR_CODES.INSUFFICIENT_PERMISSIONS
      );
    }

    // Get custom nodes for this project and public nodes
    const customNodes = await prisma.customNode.findMany({
      where: {
        OR: [{ projectId }, { isPublic: true }],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customNodes);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects/[projectId]/custom-nodes - Create a new custom node
export async function POST(request: Request) {
  try {
    const session = await requireAuth(request);
    const projectId = extractProjectId(request);
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.code) {
      validationError("Name and code are required");
    }

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      notFound("Project not found");
    }

    if (project?.userId !== session.user.id) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You don't have permission to create custom nodes in this project",
        ERROR_CODES.INSUFFICIENT_PERMISSIONS
      );
    }

    // Create the custom node
    const customNode = await prisma.customNode.create({
      data: {
        name: body.name,
        description: body.description || "",
        code: body.code,
        config: body.config || {},
        projectId,
        createdBy: session.user.id,
        isPublic: body.isPublic || false,
        metadata: body.metadata || {},
      },
    });

    return NextResponse.json(customNode);
  } catch (error) {
    return handleApiError(error);
  }
}
