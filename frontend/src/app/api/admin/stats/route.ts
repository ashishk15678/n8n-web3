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

    // Get user statistics
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalProjects,
      totalWorkflows,
      recentLogs,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      // Active users (users with status 'active' or no status)
      prisma.user.count({
        where: {
          OR: [{ emailVerified: true }, { emailVerified: false }],
        },
      }),
      // Pending users
      prisma.user.count({
        where: { emailVerified: false },
      }),
      // Suspended users
      prisma.user.count({}),
      // Total projects
      prisma.project.count(),
      // Total workflows (sum of all nodes in projects)
      prisma.project.aggregate({
        _count: {
          nodes: true,
        },
      }),
      // Recent activity logs
      prisma.log.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Transform logs into activity feed
    const recentActivity = recentLogs.map((log) => ({
      type: log.type.toLowerCase().split("_")[0], // e.g., "WORKFLOW_CREATED" -> "workflow"
      description: `${log.user.name || log.user.email} ${log.message}`,
      timestamp: log.createdAt.toISOString(),
      user: log.user.name || log.user.email,
    }));

    return NextResponse.json({
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalProjects,
      totalWorkflows: totalWorkflows._count.nodes || 0,
      recentActivity,
    });
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
