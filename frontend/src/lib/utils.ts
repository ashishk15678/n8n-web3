import { LogLevel, LogType } from "@/generated/prisma";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { prisma } from "@/lib/db";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to create a log entry
export async function createLog(data: {
  type: string;
  level: string;
  message: string;
  metadata?: any;
  projectId?: string;
  userId: string;
}) {
  try {
    return await prisma.log.create({
      data: {
        type: data.type as LogType,
        level: data.level as LogLevel,
        message: data.message,
        metadata: data.metadata,
        projectId: data.projectId,
        userId: data.userId,
      },
    });
  } catch (error) {
    console.error("Error creating log:", error);
    throw error;
  }
}
