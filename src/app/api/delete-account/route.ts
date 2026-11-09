import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function POST() {
  try {
    const userId = await requireUser();
    await prisma.$transaction([
      prisma.progressSnapshot.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
