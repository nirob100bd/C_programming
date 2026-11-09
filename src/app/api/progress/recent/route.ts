import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET() {
  try {
    const userId = await requireUser();
    const progress = await prisma.progress.findFirst({
      where: { userId },
      orderBy: { lastSavedAt: "desc" }
    });
    if (!progress) return ok(null);

    const lesson = await prisma.lesson.findUnique({
      where: { id: progress.lessonId },
      include: {
        steps: {
          orderBy: { order: "asc" },
          select: { id: true, order: true, title: true, kind: true }
        }
      }
    });
    if (!lesson) return ok(null);
    return ok({ progress, lesson });
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
