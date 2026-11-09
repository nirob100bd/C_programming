import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";

const bookmarkSchema = z.object({
  kind: z.enum(["lesson", "problem", "reference"]),
  refId: z.string().min(1).max(120)
}).strict();

export async function GET() {
  try {
    const userId = await requireUser();
    return ok(await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    }));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    const { kind, refId } = await parseBody(request, bookmarkSchema);
    const bookmark = await prisma.bookmark.upsert({
      where: { userId_kind_refId: { userId, kind, refId } },
      update: {},
      create: { userId, kind, refId }
    });
    return ok(bookmark, 201);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireUser();
    const { kind, refId } = await parseBody(request, bookmarkSchema);
    await prisma.bookmark.deleteMany({ where: { userId, kind, refId } });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
