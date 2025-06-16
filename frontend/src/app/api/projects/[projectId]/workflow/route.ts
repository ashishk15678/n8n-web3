import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Edge, Node } from "@xyflow/react";

export async function PUT(request: NextRequest) {
  try {
    const { projectId, nodes, edges } = (await request.json()) as {
      projectId: string;
      nodes: Node[];
      edges: Edge[];
    };

    // Validate projectId matches
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!nodes || !edges) {
      return NextResponse.json(
        { error: "Nodes and edges are required" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        nodes: nodes as any,
        edges: edges as any,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to fetch current workflow
export async function GET(request: NextRequest) {
  try {
    const projectId = await request?.nextUrl.href.split("/")[5];
    console.log({ projectId });
    if (!projectId)
      return NextResponse.json(
        { success: false, message: "Project id required" },
        { status: 400 }
      );

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        nodes: true,
        edges: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Ensure nodes have the required properties
    const nodes = ((project.nodes as any[]) || []).map((node) => ({
      ...node,
      position: node.position || { x: 100, y: 100 },
      type: node.type || "default",
      data: node.data || { label: "Node" },
    }));

    return NextResponse.json({
      nodes,
      edges: project.edges || [],
    });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}
