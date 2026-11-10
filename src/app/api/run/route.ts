import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";
import { runC } from "@/lib/judge";
import { log } from "@/lib/activity";
import { awardXp, checkAchievements } from "@/lib/xp";
import { recordEvidence } from "@/lib/mastery";

const runSchema = z.object({
  sourceCode: z.string().min(1).max(50_000),
  stdin: z.string().max(50_000).default(""),
  lessonId: z.string().min(1).max(64).optional(),
  stepId: z.string().min(1).max(64).optional(),
  problemId: z.string().min(1).max(64).optional(),
  mode: z.enum(["guided", "independent", "debug", "optimize", "contest"]).default("guided")
}).strict();

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    const input = await parseBody(request, runSchema);
    const lessonStep = input.lessonId && input.stepId
      ? await prisma.lessonStep.findFirst({
          where: { id: input.stepId, lessonId: input.lessonId },
          select: { id: true, expectedOutput: true, skillKeys: true, xpReward: true }
        })
      : null;
    if (input.lessonId && input.stepId && !lessonStep) throw new Error("NOT_FOUND");

    const result = await runC(input.sourceCode, input.stdin);
    const submission = await prisma.submission.create({
      data: {
        userId,
        lessonId: input.lessonId,
        problemId: input.problemId,
        sourceCode: input.sourceCode,
        stdin: input.stdin,
        stdout: result.stdout,
        stderr: result.stderr,
        compile: result.compile,
        verdict: result.verdict,
        timeMs: result.timeMs,
        memoryKb: result.memoryKb,
        mode: input.mode
      }
    });
    const lessonPassed = Boolean(
      lessonStep &&
      result.verdict === "Accepted" &&
      (lessonStep.expectedOutput === null ||
        result.stdout.replace(/\r\n/g, "\n").trimEnd() === lessonStep.expectedOutput.replace(/\r\n/g, "\n").trimEnd())
    );
    if (lessonStep && lessonPassed) {
      await awardXp(userId, lessonStep.xpReward, "lesson.step", lessonStep.id);
      await Promise.all(lessonStep.skillKeys.map((skillKey) => recordEvidence(userId, skillKey, {
        kind: "code",
        correct: true,
        weight: 2,
        note: lessonStep.id,
        at: new Date().toISOString()
      })));
    }
    await log(userId, "run", {
      submissionId: submission.id,
      verdict: result.verdict,
      lessonPassed
    });
    // Milestones unlock immediately: a run is the first achievement trigger.
    const achievements = await checkAchievements(userId).catch(() => []);
    return ok({ submissionId: submission.id, lessonPassed, achievements, ...result });
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
