import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: { steps: { orderBy: { order: "asc" } } }
    });
    if (!lesson) throw new Error("NOT_FOUND");

    // Quiz answers are checked by the progress endpoint and never sent to the browser.
    const steps = lesson.steps.map(({ quizAnswer: _answer, ...step }) => step);
    return ok({ ...lesson, steps });
  } catch (error) {
    return fail(error);
  }
}
