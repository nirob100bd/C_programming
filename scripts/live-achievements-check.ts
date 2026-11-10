/**
 * Live smoke test for the achievement engine. It needs a migrated, seeded
 * database (DATABASE_URL) and creates and deletes its own throwaway user, so it
 * is safe to run against a development database:
 *
 *   npx tsx scripts/live-achievements-check.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { checkAchievements } from "../src/lib/xp";

async function main() {
  const email = `achiever-${Date.now()}@example.com`;
  const user = await prisma.user.create({ data: { email, passwordHash: "not-a-real-hash" } });
  try {
    const elephant = await prisma.problem.findUnique({ where: { slug: "elephant" } });
    if (!elephant) throw new Error("Seed the database first: needle problem 'elephant' is missing.");

    await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: elephant.id,
        sourceCode: "int main(void) { return 0; }",
        verdict: "Accepted",
        mode: "independent",
        hintsUsed: 0
      }
    });
    await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: elephant.id,
        sourceCode: "int main(void) { return 1; }",
        verdict: "Wrong Answer",
        mode: "guided",
        hintsUsed: 2
      }
    });
    await prisma.user.update({ where: { id: user.id }, data: { xp: 650 } });

    const earned = await checkAchievements(user.id);
    const again = await checkAchievements(user.id);
    console.log("First pass :", earned.map((item) => item.key).join(", ") || "(none)");
    console.log("Second pass:", again.length, "newly awarded (idempotency check)");
    if (again.length !== 0) throw new Error("checkAchievements is not idempotent");
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
