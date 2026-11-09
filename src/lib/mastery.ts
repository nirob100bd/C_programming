import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const STATES = [
  "Not assessed",
  "Learning",
  "Developing",
  "Can solve with guidance",
  "Independent",
  "Transfer capable",
  "Mastered",
  "Needs revision"
] as const;

export type Evidence = {
  kind: "prediction" | "trace" | "code" | "debug" | "optimize" | "quiz" | "explain" | "hintless";
  correct: boolean;
  weight: number;
  note?: string;
  at: string;
};

function isEvidence(value: unknown): value is Evidence {
  if (!value || typeof value !== "object") return false;
  const evidence = value as Partial<Evidence>;
  return (
    typeof evidence.kind === "string" &&
    typeof evidence.correct === "boolean" &&
    typeof evidence.weight === "number" &&
    typeof evidence.at === "string"
  );
}

export function scoreEvidence(items: Evidence[]) {
  const weighted = items.reduce((total, evidence) => {
    const direction = evidence.correct ? 1 : -0.6;
    const independence = evidence.kind === "hintless" ? 1.2 : 1;
    return total + direction * Math.min(5, Math.max(1, evidence.weight)) * independence;
  }, 0);
  return Math.max(0, Math.min(100, Math.round(50 + weighted * 4)));
}

export function stateForScore(score: number): (typeof STATES)[number] {
  if (score <= 0) return "Not assessed";
  if (score < 25) return "Learning";
  if (score < 45) return "Developing";
  if (score < 60) return "Can solve with guidance";
  if (score < 75) return "Independent";
  if (score < 90) return "Transfer capable";
  return "Mastered";
}

export async function recordEvidence(userId: string, skillKey: string, evidence: Evidence) {
  const normalized: Evidence = {
    ...evidence,
    weight: Math.min(5, Math.max(1, Math.round(evidence.weight)))
  };

  return prisma.$transaction(async (tx) => {
    const row = await tx.skillMastery.upsert({
      where: { userId_skillKey: { userId, skillKey } },
      update: {},
      create: {
        userId,
        skillKey,
        score: 0,
        state: "Learning",
        evidence: []
      }
    });
    const previous = Array.isArray(row.evidence) ? row.evidence.filter(isEvidence) : [];
    const kept = [...previous, normalized].slice(-50);
    const score = scoreEvidence(kept);
    const state = stateForScore(score);

    return tx.skillMastery.update({
      where: { userId_skillKey: { userId, skillKey } },
      data: {
        score,
        state,
        evidence: kept as unknown as Prisma.InputJsonValue
      }
    });
  });
}

export async function scheduleRevision(
  userId: string,
  skillKey: string,
  now = new Date()
) {
  const dueAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return prisma.revisionItem.upsert({
    where: { userId_skillKey: { userId, skillKey } },
    update: { dueAt, lastResult: "pending" },
    create: { userId, skillKey, dueAt }
  });
}
