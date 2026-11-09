import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";
import { judgeAgainstTests } from "@/lib/judge";
import { awardXp } from "@/lib/xp";
import { recordEvidence, scheduleRevision } from "@/lib/mastery";
import { log } from "@/lib/activity";

const submitSchema = z.object({
  sourceCode: z.string().min(1).max(50_000),
  mode: z.enum(["guided", "independent", "debug", "optimize", "contest"]).default("independent"),
  hintsUsed: z.number().int().min(0).max(5).default(0)
}).strict();

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const userId = await requireUser();
    const input = await parseBody(request, submitSchema);
    const problem = await prisma.problem.findUnique({
      where: { slug: params.slug },
      include: { tests: { orderBy: { order: "asc" } } }
    });
    if (!problem) throw new Error("NOT_FOUND");
    if (problem.tests.length === 0) throw new Error("PROBLEM_HAS_NO_TESTS");

    const result = await judgeAgainstTests(
      input.sourceCode,
      problem.tests.map((test) => ({ input: test.input, expected: test.expected })),
      problem.timeLimitMs,
      problem.memoryLimitKb
    );
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        sourceCode: input.sourceCode,
        verdict: result.verdict,
        stdout: result.stdout,
        stderr: result.stderr,
        compile: result.compile,
        timeMs: result.timeMs,
        memoryKb: result.memoryKb,
        mode: input.mode,
        hintsUsed: input.hintsUsed
      }
    });

    const accepted = result.verdict === "Accepted";
    const independent = input.mode === "independent" && input.hintsUsed === 0;
    if (accepted) {
      await awardXp(userId, independent ? 40 : 20, "problem.accepted", problem.id);
    }
    await Promise.all(problem.skillKeys.map(async (skillKey) => {
      await recordEvidence(userId, skillKey, {
        kind: accepted && independent ? "hintless" : "code",
        correct: accepted,
        weight: accepted ? 3 : 1,
        note: problem.slug,
        at: new Date().toISOString()
      });
      if (!accepted) await scheduleRevision(userId, skillKey);
    }));
    await log(userId, "problem.submitted", {
      problemId: problem.id,
      submissionId: submission.id,
      verdict: result.verdict
    });

    return ok({ submissionId: submission.id, ...result });
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
