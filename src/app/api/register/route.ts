import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, parseBody } from "@/lib/api";
import { log } from "@/lib/activity";
import { awardXp } from "@/lib/xp";

const registerSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(1).max(80).optional()
}).strict();

export async function POST(request: Request) {
  try {
    const { email, password, name } = await parseBody(request, registerSchema);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("EMAIL_TAKEN");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || null },
      select: { id: true, email: true }
    });
    await log(user.id, "account.created", { email: user.email });
    await awardXp(user.id, 10, "account.created", user.id);

    return ok(user, 201);
  } catch (error) {
    return fail(error);
  }
}
