import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET() {
  try {
    const userId = await requireUser();
    const [skills, mastery, revisions] = await Promise.all([
      prisma.skill.findMany({ orderBy: [{ world: "asc" }, { key: "asc" }] }),
      prisma.skillMastery.findMany({ where: { userId } }),
      prisma.revisionItem.findMany({
        where: { userId, dueAt: { lte: new Date() } },
        orderBy: { dueAt: "asc" }
      })
    ]);
    const masteryBySkill = new Map(mastery.map((item) => [item.skillKey, item]));
    return ok({
      skills: skills.map((skill) => ({
        ...skill,
        mastery: masteryBySkill.get(skill.key) ?? null
      })),
      revisions
    });
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
