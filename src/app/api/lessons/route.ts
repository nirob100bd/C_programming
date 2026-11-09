import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      orderBy: [{ worldOrder: "asc" }, { order: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        world: true,
        worldOrder: true,
        order: true,
        summary: true,
        objectives: true,
        prerequisites: true
      }
    });
    return ok(lessons);
  } catch (error) {
    return fail(error);
  }
}
