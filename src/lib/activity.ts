import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function logActivity(
  userId: string,
  kind: string,
  payload: Record<string, unknown> = {}
) {
  return prisma.activity.create({
    data: { userId, kind, payload: payload as Prisma.InputJsonValue }
  });
}

// Kept as a concise alias for route handlers.
export const log = logActivity;
