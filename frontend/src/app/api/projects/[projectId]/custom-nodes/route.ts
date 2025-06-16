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

// Helper function to extract nodeId from URL (for PUT/DELETE)
function extractNodeId(request: NextRequest | Request): string {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  return pathParts[5]; // /api/projects/[projectId]/custom-nodes/[nodeId]
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
        description: body.description,
        code: body.code,
        config: body.config || {},
        projectId,
        createdBy: session.user.id,
        isPublic: body.isPublic || false,
        metadata: body.metadata || {},
      },
    });

    // Create a default node instance of this custom node
    await prisma.node.create({
      data: {
        type: "custom",
        position: { x: 200, y: 200 },
        data: {
          label: customNode.name,
          customNodeId: customNode.id,
          code: customNode.code,
          config: customNode.config,
          metadata: customNode.metadata,
        },
        projectId,
        customNodeId: customNode.id,
      },
    });

    return NextResponse.json(customNode);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/projects/[projectId]/custom-nodes/[nodeId] - Update a custom node
export async function PUT(request: Request) {
  try {
    const session = await requireAuth(request);
    const projectId = extractProjectId(request);
    const nodeId = extractNodeId(request);
    const body = await request.json();

    // Verify custom node exists and user has access
    const customNode = await prisma.customNode.findUnique({
      where: { id: nodeId },
    });

    if (!customNode) {
      notFound("Custom node not found");
    }

    if (
      customNode?.projectId !== projectId ||
      customNode.createdBy !== session.user.id
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You don't have permission to update this custom node",
        ERROR_CODES.INSUFFICIENT_PERMISSIONS
      );
    }

    // Update the custom node
    const updatedNode = await prisma.customNode.update({
      where: { id: nodeId },
      data: {
        name: body.name,
        description: body.description,
        code: body.code,
        config: body.config,
        isPublic: body.isPublic,
        metadata: body.metadata,
        version: { increment: 1 },
      },
    });

    // Update all instances of this custom node
    await prisma.node.updateMany({
      where: { customNodeId: nodeId },
      data: {
        data: {
          label: updatedNode.name,
          code: updatedNode.code,
          config: updatedNode.config,
          metadata: updatedNode.metadata,
        },
      },
    });

    return NextResponse.json(updatedNode);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/projects/[projectId]/custom-nodes/[nodeId] - Delete a custom node
export async function DELETE(request: Request) {
  try {
    const session = await requireAuth(request);
    const projectId = extractProjectId(request);
    const nodeId = extractNodeId(request);

    // Verify custom node exists and user has access
    const customNode = await prisma.customNode.findUnique({
      where: { id: nodeId },
      include: {
        Node: true,
      },
    });

    if (!customNode) {
      notFound("Custom node not found");
    }

    if (
      customNode?.projectId !== projectId ||
      customNode.createdBy !== session.user.id
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You don't have permission to delete this custom node",
        ERROR_CODES.INSUFFICIENT_PERMISSIONS
      );
    }

    // Delete all nodes that use this custom node
    await prisma.node.deleteMany({
      where: { customNodeId: nodeId },
    });

    // Delete the custom node
    await prisma.customNode.delete({
      where: { id: nodeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
