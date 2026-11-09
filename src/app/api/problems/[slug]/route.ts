import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { slug: params.slug },
      include: {
        tests: {
          where: { hidden: false },
          orderBy: { order: "asc" },
          select: { id: true, input: true, expected: true, order: true }
        }
      }
    });
    if (!problem) throw new Error("NOT_FOUND");

    const { referenceCode: _reference, editorial: _editorial, ...safeProblem } = problem;
    return ok({
      ...safeProblem,
      editorialAvailable: Boolean(problem.editorial)
    });
  } catch (error) {
    return fail(error);
  }
}
