import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET() {
  try {
    const userId = await requireUser();
    const [
      user,
      progress,
      snapshots,
      submissions,
      notes,
      bookmarks,
      mastery,
      achievements,
      activity,
      projects,
      revisions,
      hintEvents
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, xp: true, rank: true, theme: true, editorFont: true, createdAt: true, updatedAt: true }
      }),
      prisma.progress.findMany({ where: { userId } }),
      prisma.progressSnapshot.findMany({ where: { userId } }),
      prisma.submission.findMany({ where: { userId } }),
      prisma.note.findMany({ where: { userId } }),
      prisma.bookmark.findMany({ where: { userId } }),
      prisma.skillMastery.findMany({ where: { userId } }),
      prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
      prisma.activity.findMany({ where: { userId } }),
      prisma.project.findMany({ where: { userId } }),
      prisma.revisionItem.findMany({ where: { userId } }),
      prisma.hintEvent.findMany({ where: { userId } })
    ]);
    return ok({
      user,
      progress,
      snapshots,
      submissions,
      notes,
      bookmarks,
      mastery,
      achievements,
      activity,
      projects,
      revisions,
      hintEvents,
      exportedAt: new Date().toISOString(),
      formatVersion: 1
    });
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
