import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is admin
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all users with their project counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
          },
        },
        sessions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
        projects: {
          select: {
            id: true,
            nodes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let projectCount = 0;
    let workflowCount = 0;

    // users.forEach((u) => {
    //   projectCount += u.projects.length;
    //   workflowCount += u.projects.reduce(
    //     (acc, project) => acc + project.nodes.length,
    //     0
    //   );
    // });

    // Transform the data to match the frontend interface
    const transformedUsers = users.map((user) => {
      const projectCount = user._count.projects;
      const workflowCount = user.projects.reduce(
        (acc, project) => acc + (project.nodes?.length || 0),
        0
      );

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        projectCount,
        workflowCount,
        status: user.emailVerified ? "active" : "pending",
        role: "user", // Default role since we removed role field
      };
    });

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("[ADMIN_USERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
