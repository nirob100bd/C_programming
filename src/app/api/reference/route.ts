import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const search = new URL(request.url).searchParams;
    const query = (search.get("q") ?? "").trim().slice(0, 100);
    const category = search.get("category")?.trim().slice(0, 50);
    const entries = await prisma.referenceEntry.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(query ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { body: { contains: query, mode: "insensitive" as const } }
          ]
        } : {})
      },
      orderBy: [{ category: "asc" }, { title: "asc" }],
      take: 100
    });
    return ok(entries);
  } catch (error) {
    return fail(error);
  }
}
