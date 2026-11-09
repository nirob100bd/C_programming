import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";

const profileSchema = z.object({
  theme: z.enum(["system", "light", "dark"]).optional(),
  editorFont: z.number().int().min(10).max(24).optional(),
  name: z.string().trim().min(1).max(80).optional()
}).strict().refine((value) => Object.keys(value).length > 0, "At least one setting is required.");

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  xp: true,
  rank: true,
  theme: true,
  editorFont: true,
  createdAt: true
} as const;

export async function GET() {
  try {
    const userId = await requireUser();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect
    });
    if (!user) throw new Error("NOT_FOUND");
    return ok(user);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUser();
    const data = await parseBody(request, profileSchema);
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: publicUserSelect
    });
    return ok(user);
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
