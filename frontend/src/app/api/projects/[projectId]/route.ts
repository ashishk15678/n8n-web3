import { prisma } from "@/lib/db";
import { tryCatch, createErrorResponse } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/projects/[projectId] - Delete a project
export const DELETE = tryCatch(async (request: NextRequest) => {
  const projectId = request.nextUrl.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  // auth check
  const authUser = (await auth.api.getSession({
    headers: request.headers,
  }))!.user;

  if (!authUser) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Verify project ownership
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: authUser.id,
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found or unauthorized" },
      { status: 404 }
    );
  }

  // Delete the project
  await prisma.project.delete({
    where: { id: projectId },
  });

  return NextResponse.json({ success: true });
}, "Failed to delete project");
