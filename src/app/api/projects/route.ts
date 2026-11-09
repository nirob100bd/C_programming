import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/api";

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).default("")
}).strict();

export async function GET() {
  try {
    const userId = await requireUser();
    return ok(await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    }));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUser();
    const { name, description } = await parseBody(request, createProjectSchema);
    const files = [{
      name: "main.c",
      content: "#include <stdio.h>\n\nint main(void) {\n    printf(\"Hello, CForge!\\n\");\n    return 0;\n}\n"
    }];
    const project = await prisma.project.create({
      data: { userId, name, description, files }
    });
    return ok(project, 201);
  } catch (error) {
    return fail(error);
  }
}

export const dynamic = "force-dynamic";
