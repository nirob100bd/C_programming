import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { boundedQueryInteger } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const userId = await requireUser();
    const search = new URL(request.url).searchParams;
    const kind = search.get("kind")?.trim();
    const take = boundedQueryInteger(search.get("take"), 50, 1, 200);
    const items = await prisma.activity.findMany({
      where: { userId, ...(kind ? { kind } : {}) },
      orderBy: { createdAt: "desc" },
      take
    });
    return ok(items);
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
