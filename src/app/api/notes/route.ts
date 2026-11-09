import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";

const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().max(20_000),
  lessonId: z.string().min(1).max(64).optional(),
  problemId: z.string().min(1).max(64).optional()
}).strict();

export async function GET() {
  try {
    const userId = await requireUser();
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });
    return ok(notes);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    const data = await parseBody(request, createNoteSchema);
    const note = await prisma.note.create({ data: { ...data, userId } });
    return ok(note, 201);
  } catch (error) {
    return fail(error);
  }
}
