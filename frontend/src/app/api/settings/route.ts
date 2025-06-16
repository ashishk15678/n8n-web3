import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth, authClient } from "@/lib/auth";
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const settings = await prisma.settings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = await prisma.settings.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          timezone: "Asia/Kolkata",
          language: "en",
        },
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { theme, emailNotifications, timezone, language } = body;

    const settings = await prisma.settings.update({
      where: {
        userId: session.user.id,
      },
      data: {
        ...(theme && { theme }),
        ...(typeof emailNotifications === "boolean" && { emailNotifications }),
        ...(timezone && { timezone }),
        ...(language && { language }),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
