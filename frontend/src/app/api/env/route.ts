import { NextResponse } from "next/server";
import { auth, ServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
export async function GET(req: Request) {
  const user = await ServerAuth(req);
  if (user instanceof NextResponse) {
    return user;
  }
  console.log({ userId: user.id });
  const envs = await prisma.env.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json(envs);
}
export async function PUT(req: Request) {
  const user = await ServerAuth(req);
  if (user instanceof NextResponse) {
    return user;
  }
  const env = await req.json();
  const updatedEnv = await prisma.env.create({
    data: env,
  });
  return NextResponse.json(updatedEnv);
}

export async function POST(req: Request) {
  const user = await ServerAuth(req);
  if (user instanceof NextResponse) {
    return user;
  }

  const env = await req.json();
  console.log({ env });
  if (env.name == null || env.value == null || env.envId == null) {
    return NextResponse.json(
      { success: false, error: "Name and value and id are required" },
      { status: 400 }
    );
  }

  if (env.name.length > 100) {
    return NextResponse.json(
      { success: false, error: "Name must be less than 100 characters" },
      { status: 400 }
    );
  }

  const newEnv = await prisma.user.update({
    where: { id: user.id },
    data: {
      envs: {
        create: { name: env.name, value: env.value, generatedId: env.envId },
      },
    },
  });
  return NextResponse.json({ success: true, env: newEnv });
}
