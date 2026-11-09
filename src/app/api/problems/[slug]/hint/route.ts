import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ApiError, fail, ok, parseBody } from "@/lib/api";

const hintSchema = z.object({
  level: z.number().int().min(1).max(5)
}).strict();

function progressiveHint(editorial: string, level: number) {
  const parts = editorial
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const take = Math.max(1, Math.ceil(parts.length * (level / 5)));
  return parts.slice(0, take).join(" ");
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const userId = await requireUser();
    const { level } = await parseBody(request, hintSchema);
    const problem = await prisma.problem.findUnique({ where: { slug: params.slug } });
    if (!problem) throw new Error("NOT_FOUND");

    const previous = await prisma.hintEvent.findFirst({
      where: { userId, problemId: problem.id },
      orderBy: { level: "desc" }
    });
    if (level > (previous?.level ?? 0) + 1) {
      throw new ApiError("HINT_ORDER", 400, "Hints must be unlocked in order.");
    }
    const existing = await prisma.hintEvent.findFirst({
      where: { userId, problemId: problem.id, level }
    });
    if (!existing) {
      await prisma.hintEvent.create({ data: { userId, problemId: problem.id, level } });
    }

    if (level === 5) {
      return ok({
        level,
        content: problem.referenceCode,
        editorial: problem.editorial,
        final: true
      });
    }
    return ok({
      level,
      content: progressiveHint(problem.editorial, level),
      final: false
    });
  } catch (error) {
    return fail(error);
  }
}
