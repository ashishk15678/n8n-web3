import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth, authClient } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, username } = body;

    // Validate username format (alphanumeric with underscores and hyphens)
    if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return new NextResponse(
        "Username can only contain letters, numbers, underscores, and hyphens",
        { status: 400 }
      );
    }

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser && existingUser.email !== session.user.email) {
        return new NextResponse("Username is already taken", { status: 400 });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || null,
        username: username || undefined,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_PROFILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
