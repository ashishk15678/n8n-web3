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
  return pathParts[3]; // /api/projects/[projectId]/custom-nodes/[nodeId]
}

// Helper function to extract nodeId from URL
function extractNodeId(request: NextRequest | Request): string {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  return pathParts[5]; // /api/projects/[projectId]/custom-nodes/[nodeId]
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
        description: body.description || "",
        code: body.code,
        config: body.config || {},
        isPublic: body.isPublic || false,
        metadata: body.metadata || {},
        version: { increment: 1 },
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
