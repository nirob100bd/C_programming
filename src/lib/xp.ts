import { prisma } from "@/lib/prisma";

export const RANKS = [
  [0, "Beginner"],
  [100, "C Explorer"],
  [300, "Programmer"],
  [600, "Problem Solver"],
  [1000, "Algorithm Designer"],
  [1500, "Systems Developer"],
  [2200, "Advanced C Engineer"],
  [3000, "Competitive Programmer"],
  [4000, "C Specialist"],
  [5500, "Elite Engineer"]
] as const;

export function rankFor(xp: number): string {
  let rank: string = RANKS[0][1];
  for (const [minimum, name] of RANKS) {
    if (xp >= minimum) rank = name;
  }
  return rank;
}

export async function awardXp(
  userId: string,
  amount: number,
  reason: string,
  ref: string
) {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  const key = `${userId}:${reason}:${ref}`;

  return prisma.$transaction(async (tx) => {
    const inserted = await tx.xpEvent.createMany({
      data: [{ userId, amount, reason, key }],
      skipDuplicates: true
    });

    if (inserted.count === 0) {
      return tx.xpEvent.findUnique({ where: { key } });
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } },
      select: { xp: true, rank: true }
    });
    const rank = rankFor(user.xp);
    if (rank !== user.rank) {
      await tx.user.update({ where: { id: userId }, data: { rank } });
    }

    return tx.xpEvent.findUnique({ where: { key } });
  });
}
