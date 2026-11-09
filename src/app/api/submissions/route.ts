import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { boundedQueryInteger } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const userId = await requireUser();
    const take = boundedQueryInteger(new URL(request.url).searchParams.get("take"), 20, 1, 100);
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take
    });
    return ok(submissions);
  } catch (error) {
    return fail(error);
  }
}
