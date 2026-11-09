import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const entry = await prisma.referenceEntry.findUnique({
      where: { slug: params.slug }
    });
    if (!entry) throw new Error("NOT_FOUND");
    return ok(entry);
  } catch (error) {
    return fail(error);
  }
}
