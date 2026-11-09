import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

const difficultySchema = z.enum([
  "introductory",
  "beginner",
  "easy",
  "intermediate",
  "advanced",
  "expert",
  "master"
]);

export async function GET(request: Request) {
  try {
    const search = new URL(request.url).searchParams;
    const difficultyRaw = search.get("difficulty");
    const difficulty = difficultyRaw ? difficultySchema.parse(difficultyRaw) : undefined;
    const tag = search.get("tag")?.trim().toLowerCase();
    if (tag && (tag.length > 40 || !/^[a-z0-9-]+$/.test(tag))) {
      throw new z.ZodError([{ code: "custom", path: ["tag"], message: "Invalid tag." }]);
    }

    const problems = await prisma.problem.findMany({
      where: {
        ...(difficulty ? { difficulty } : {}),
        ...(tag ? { tags: { has: tag } } : {})
      },
      orderBy: [{ difficulty: "asc" }, { title: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
        expectedComplexity: true
      }
    });
    return ok(problems);
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
