/**
 * CLI entry point for `npm run prisma:seed`.
 *
 * The catalog itself lives in `prisma/seed.ts`, which stays free of top-level
 * side effects so tests and the offline content verifier can import the arrays
 * without touching a database.
 */
import { main } from "./seed";

main().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
