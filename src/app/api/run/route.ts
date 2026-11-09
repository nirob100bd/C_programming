import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";
import { runC } from "@/lib/judge";
import { log } from "@/lib/activity";

const runSchema = z.object({
  sourceCode: z.string().min(1).max(50_000),
  stdin: z.string().max(50_000).default(""),
  lessonId: z.string().min(1).max(64).optional(),
  problemId: z.string().min(1).max(64).optional(),
  mode: z.enum(["guided", "independent", "debug", "optimize", "contest"]).default("guided")
}).strict();

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    const input = await parseBody(request, runSchema);
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
    await log(userId, "run", {
      submissionId: submission.id,
      verdict: result.verdict
    });
    return ok({ submissionId: submission.id, ...result });
  } catch (error) {
    return fail(error);
  }
}
