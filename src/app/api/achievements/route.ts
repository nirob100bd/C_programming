import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET() {
  try {
    const userId = await requireUser();
    const [achievements, earned] = await Promise.all([
      prisma.achievement.findMany({ orderBy: { name: "asc" } }),
      prisma.userAchievement.findMany({ where: { userId } })
    ]);
    const earnedAt = new Map(earned.map((item) => [item.achievementId, item.earnedAt]));
    return ok(achievements.map((achievement) => ({
      ...achievement,
      earned: earnedAt.has(achievement.id),
      earnedAt: earnedAt.get(achievement.id) ?? null
    })));
  } catch (error) {
    return fail(error);
  }
}
