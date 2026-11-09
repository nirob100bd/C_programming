import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ApiError, fail, ok, parseBody } from "@/lib/api";
import { log } from "@/lib/activity";
import { awardXp } from "@/lib/xp";
import { recordEvidence } from "@/lib/mastery";
import { cuid } from "@/lib/validation";

const saveSchema = z.object({
  lessonId: cuid,
  stepId: cuid,
  code: z.string().max(50_000),
  completed: z.boolean().optional(),
  answer: z.string().max(500).optional()
}).strict();

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    const input = await parseBody(request, saveSchema);

    const result = await prisma.$transaction(async (tx) => {
      const step = await tx.lessonStep.findFirst({
        where: { id: input.stepId, lessonId: input.lessonId },
        select: { id: true, kind: true, quizAnswer: true, skillKeys: true, xpReward: true }
      });
      if (!step) throw new ApiError("INVALID_STEP", 400, "The step does not belong to this lesson.");

      const quizCorrect = step.kind === "quiz"
        ? input.answer !== undefined && input.answer === step.quizAnswer
        : null;
      const completed = input.completed === undefined
        ? undefined
        : input.completed && (quizCorrect ?? true);

      const previous = await tx.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId: input.lessonId } }
      });
      if (previous && previous.code && previous.code !== input.code) {
        await tx.progressSnapshot.create({
          data: {
            userId,
            lessonId: input.lessonId,
            stepId: previous.stepId,
            code: previous.code
          }
        });
      }

      const progress = await tx.progress.upsert({
        where: { userId_lessonId: { userId, lessonId: input.lessonId } },
        update: {
          stepId: input.stepId,
          code: input.code,
          lastSavedAt: new Date(),
          version: { increment: 1 },
          ...(completed !== undefined ? { completed } : {})
        },
        create: {
          userId,
          lessonId: input.lessonId,
          stepId: input.stepId,
          code: input.code,
          completed: completed ?? false
        }
      });
      return {
        progress,
        quizCorrect,
        skillKeys: step.skillKeys,
        xpReward: step.xpReward
      };
    });

    if (result.quizCorrect) {
      await awardXp(userId, result.xpReward, "lesson.step", input.stepId);
      await Promise.all(result.skillKeys.map((skillKey) => recordEvidence(userId, skillKey, {
        kind: "quiz",
        correct: true,
        weight: 2,
        note: input.stepId,
        at: new Date().toISOString()
      })));
    }
    await log(userId, "progress.saved", {
      lessonId: input.lessonId,
      stepId: input.stepId,
      completed: result.progress.completed
    });
    return ok({ progress: result.progress, quizCorrect: result.quizCorrect });
  } catch (error) {
    return fail(error);
  }
}

export async function GET(request: Request) {
  try {
    const userId = await requireUser();
    const lessonId = new URL(request.url).searchParams.get("lessonId");
    if (!lessonId) throw new ApiError("MISSING_LESSON", 400, "lessonId is required.");
    if (lessonId.length > 64) throw new ApiError("INVALID_LESSON", 400, "lessonId is invalid.");

    const progress = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } }
    });
    return ok(progress);
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
