import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        steps: {
          orderBy: { order: "asc" },
          // Quiz answers are checked by the progress endpoint and never selected here.
          select: {
            id: true,
            lessonId: true,
            order: true,
            kind: true,
            title: true,
            body: true,
            starterCode: true,
            expectedOutput: true,
            testInput: true,
            quizOptions: true,
            hints: true,
            skillKeys: true,
            xpReward: true
          }
        }
      }
    });
    if (!lesson) throw new Error("NOT_FOUND");
    return ok(lesson);
  } catch (error) {
    return fail(error);
  }
}
