import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth, authClient } from "@/lib/auth";
import { LogLevel } from "@/generated/prisma";
import { LogType } from "@/generated/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const levels = searchParams.get("levels")?.split(",") || [];
    const types = searchParams.get("types")?.split(",") || [];
    const timeRange = searchParams.get("timeRange") || "24h";

    // Calculate time range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case "1h":
        startDate.setHours(now.getHours() - 1);
        break;
      case "24h":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }

    // Build where clause
    const where = {
      userId: session.user.id,
      createdAt: {
        gte: startDate,
      },
      ...(search && {
        OR: [
          { message: { contains: search, mode: "insensitive" } },
          { project: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(levels.length > 0 && { level: { in: levels } }),
      ...(types.length > 0 && { type: { in: types } }),
    };

    // Fetch logs with pagination
    const logs = await prisma.log.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to last 100 logs
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
