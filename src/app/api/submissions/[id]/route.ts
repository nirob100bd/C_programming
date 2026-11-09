import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireUser();
    const submission = await prisma.submission.findFirst({
      where: { id: params.id, userId }
    });
    if (!submission) throw new Error("NOT_FOUND");
    return ok(submission);
  } catch (error) {
    return fail(error);
  }
}
