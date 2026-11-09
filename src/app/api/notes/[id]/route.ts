import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";

const updateNoteSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  body: z.string().max(20_000).optional()
}).strict().refine((data) => Object.keys(data).length > 0, "At least one field is required.");

async function ownedNote(id: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id, userId } });
  if (!note) throw new Error("NOT_FOUND");
  return note;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireUser();
    const data = await parseBody(request, updateNoteSchema);
    const note = await ownedNote(params.id, userId);
    return ok(await prisma.note.update({ where: { id: note.id }, data }));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireUser();
    const note = await ownedNote(params.id, userId);
    await prisma.note.delete({ where: { id: note.id } });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
