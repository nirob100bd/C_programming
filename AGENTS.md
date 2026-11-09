# CForge repository guide

## Non-negotiable boundaries

- Read a file before modifying it and update `PLAN.md` when adding an unplanned deliverable.
- Keep changes in small `type: subject` commits and run `npm test` before each commit.
- Update `STATUS.md` at the end of every work session.
- Never execute user C in Next.js (`child_process`, local GCC, shell scripts, or WASM are forbidden runtime shortcuts). Use Judge0 and fail clearly when unavailable.
- Never fabricate verdicts, XP, mastery, or service health.
- Protected route handlers call `requireUser()` before private access and use only its session-derived ID.
- Private row queries include `userId`, or first fetch a row with both resource ID and `userId` before mutation.
- Never send secrets, password hashes, hidden tests, quiz answers, editorials, or reference solutions to ordinary browser payloads.

## Project map

- `src/app/api` — App Router handlers. Every exported method needs a test.
- `src/lib` — business logic. Every exported behavior needs focused tests.
- `src/app/(app)` — signed-in product pages.
- `src/components` — reusable UI.
- `prisma/schema.prisma` — data model; commit every schema change with a migration.
- `prisma/seed.ts` — stable-key upserts; content arrays are append-friendly.
- `__tests__` — no live-service dependency; integration acceptance lives in `docs/TESTING.md`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

With disposable services also run:

```bash
npm run prisma:migrate -- --name <descriptive-name>
npm run prisma:seed
```

Do not weaken checks to make a change pass. Document unavailable external services in `STATUS.md` and continue with everything that can be verified safely.

## Current implementation notes

- Prisma is version 7 and uses `prisma.config.ts`, `@prisma/adapter-pg`, and the generated client under `src/generated/prisma`.
- NextAuth is v4 credentials/JWT because this code uses `getServerSession` and `NextAuthOptions`.
- Judge0 language ID defaults to 50; deployments must verify their `/languages` mapping.
- IDE multi-file persistence is real, but execution intentionally compiles only the active `.c` file until a true Judge0 multi-translation-unit design ships.
- See `STATUS.md` before choosing the next milestone.
