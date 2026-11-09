import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ApiError, fail, ok, parseBody } from "@/lib/api";
import { projectFileSchema } from "@/lib/validation";

const updateProjectSchema = z.object({
  files: z.array(projectFileSchema).min(1).max(20).optional(),
  activeFile: z.string().trim().min(1).max(120).optional(),
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).optional()
}).strict().refine((data) => Object.keys(data).length > 0, "At least one field is required.").superRefine((data, context) => {
  if (!data.files) return;
  const names = data.files.map((file) => file.name);
  if (new Set(names).size !== names.length) {
    context.addIssue({ code: "custom", path: ["files"], message: "File names must be unique." });
  }
  if (data.activeFile && !names.includes(data.activeFile)) {
    context.addIssue({ code: "custom", path: ["activeFile"], message: "The active file must exist." });
  }
  const total = data.files.reduce((size, file) => size + file.content.length, 0);
  if (total > 500_000) {
    context.addIssue({ code: "custom", path: ["files"], message: "Project content is too large." });
  }
});

async function ownedProject(id: string, userId: string) {
  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) throw new Error("NOT_FOUND");
  return project;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireUser();
    return ok(await ownedProject(params.id, userId));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireUser();
    const data = await parseBody(request, updateProjectSchema);
    const existing = await ownedProject(params.id, userId);
    if (data.activeFile && !data.files) {
      const files = Array.isArray(existing.files) ? existing.files : [];
      if (!files.some((file) => typeof file === "object" && file !== null && "name" in file && file.name === data.activeFile)) {
        throw new ApiError("INVALID_ACTIVE_FILE", 400, "The active file must exist.");
      }
    }
    return ok(await prisma.project.update({
      where: { id: existing.id },
      data
    }));
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
    const existing = await ownedProject(params.id, userId);
    await prisma.project.delete({ where: { id: existing.id } });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
