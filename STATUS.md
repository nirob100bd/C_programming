# CForge Status

## Done

- [x] Next.js 14 App Router, strict TypeScript, Tailwind, responsive light/dark product shell
- [x] Prisma 7 PostgreSQL schema, generated client, and committed initial migration
- [x] Credentials auth with bcrypt, JWT sessions, registration, middleware, and server-derived identity
- [x] User-scoped progress API with snapshots, debounced autosave, exact lesson/step/code resume
- [x] Lesson, problem, note, bookmark, reference, project, export, and account-deletion APIs
- [x] Judge0 integration with bounded polling, clear 503/504 failures, real verdict persistence, and hidden tests
- [x] Idempotent XP/ranks plus weighted, deduplicated mastery evidence and revision scheduling
- [x] Dashboard, world map, lesson flow, arena, mastery, history, reference, projects, settings, IDE, and pointer lab
- [x] Seed catalog (foundation): 78 skills, 12 achievements, 12 reference entries, 20 foundation lessons, Elephant and Sum problems
- [x] Quiz answers/reference solutions/hidden tests withheld from ordinary public payloads
- [x] Automated tests for every API method and all core business logic (147 passing tests at last update)
- [x] README plus Judge0, deployment, and testing documentation
- [x] Live PostgreSQL 18 verification: initial migration deployed, the seed completed twice idempotently, and persisted counts matched 78 skills, 12 achievements, 12 reference entries, 20 lessons, and 2 problems
- [x] Curriculum milestone 2: Worlds 1–4 expanded from 13 to 24 lessons (30 lessons and 104 steps overall) with reading, quiz, code, debug, and optimize steps
- [x] Every lesson code step ships `starterCode`, `testInput`, `expectedOutput`, `skillKeys`, and a verified `solutionCode`
- [x] Problem bank grown to 18 judged problems (arrays, strings, math, sorting, binary search, prefix sums, stacks, DP, matrices) with 81 tests, 44 of them hidden
- [x] Reference library grown to 50 entries covering the essential C standard library and language qualifiers
- [x] `checkAchievements(userId)` in `src/lib/xp.ts`: 36 rules over submissions, accepted skills, XP ledger step kinds, mastery states, streaks, and 36 seeded achievement definitions
- [x] Achievements awarded inline from `/api/run` and `/api/problems/[slug]/submit`; both responses include the newly earned badges
- [x] `/achievements` page with full-colour earned badges, greyscale locked ones, progress summary, and nav entry
- [x] `npm run verify:content` compiles 65 reference programs with GCC and checks 47 lesson exercises and 81 problem tests; wired into the test suite as `__tests__/curriculum.test.ts`
- [x] Live verification: migration applied to PostgreSQL 18, the seed ran twice idempotently (78 skills, 36 achievements, 50 references, 30 lessons, 18 problems, 104 steps, 81 tests), and `scripts/live-achievements-check.ts` confirmed real awards plus idempotency
- [x] Algorithm visualizer at `/labs/algorithms`: bubble sort, binary search, and breadth-first search replayed from pure frame generators (`src/lib/algorithm-steps.ts`) with Play/Pause, Step forward/back, Reset, a timeline slider, and ←/→/space keyboard control
- [x] Pointer lab rebuilt on a small C execution model (`src/lib/memory-model.ts`): stack frame, `malloc`/`free`, real addresses, recycled blocks at a new address, and explicit use-after-free/double-free warnings
- [x] Labs navigation became a dropdown (Pointer lab, Algorithms) with a mobile labs row; 147 tests across 18 suites now cover the frame generators, memory model, both lab pages, and the dropdown
- [x] `Dockerfile` (standalone `runner` + `tools` targets), `docker-compose.yml` (PostgreSQL + one-shot migrate/seed + web), and `.dockerignore`, documented in README "Run with Docker" and `docs/DEPLOYMENT.md`

## In progress

- [ ] Expand lesson depth across Worlds 5–12; Worlds 0–4 are now deep, but Worlds 5 and above are still single-lesson slices
- [ ] Adaptive recommendation engine beyond weakest-skill and due-revision displays
- [ ] Pointer lab v3: arrays of pointers, pointer arithmetic across words, and allocator fragmentation scenarios
- [ ] Turn algorithm traces into mastery evidence (predict-the-next-frame questions)
- [ ] Contest sessions and optimized-solution mode

## Known issues

- Distributed rate limiting is not implemented. Add it at the reverse proxy/application layer before public deployment.
- Hidden tests run sequentially through Judge0, favoring simple correctness and isolation over throughput.
- The IDE persists multiple files but compiles only the active `.c` translation unit; it does not pretend to provide a multi-file linker yet.
- `Progress.completed` is lesson-level, so per-step completion checkmarks are not persisted independently.
- Achievements are evaluated on demand after a run or submission. Passing steps and quizzes earn XP but do not trigger a check until the next run, submission, or achievements request, so step-kind badges can lag by one action.
- Streaks use the server's local calendar day. Users in other time zones see day boundaries shifted.
- Activity and progress snapshots need a production retention/pruning policy.
- The Docker images were written and reviewed but never built in this workspace (no Docker daemon available), so `docker compose up --build` has not been executed here. The underlying `next build` + `output: "standalone"` server was built and HTTP-smoke-tested directly.
- The Compose stack does not include Judge0; runs and submissions return HTTP 503 until `JUDGE0_URL` points at a reachable Judge0 CE instance.
- No Judge0 daemon is available in this workspace, so real compilation and the browser/two-account acceptance flows that depend on judging remain external-service verification tasks. Unit/route tests do not simulate Judge0.

## Decisions made

- The Arena-managed branch name is fixed, so this work stays on `arena/4b431a84-c-programming` instead of the requested `cforge/labs-and-deploy` (same substitution as the previous milestone's `cforge/curriculum-2`).
- Lab animations render pre-computed frames rather than animating ad hoc UI state, so the visualizer cannot display a state the algorithm never visits.
- The pointer lab is a deterministic teaching model, not an emulator: it models one allocation, a fixed 16-byte heap stride, and a reuse offset so a recycled block is visibly at a different address.
- `prisma/seed.ts` is a side-effect-free module with a typed catalog and `prisma/seed-run.ts` as its CLI entry point, so tests and the offline verifier can import the content without a database.
- Achievement rules live in code and are keyed to seeded definitions; a unit test fails if the two lists drift.
- Lesson and problem reference solutions carry a `solutionCode` that is never persisted or sent to the browser, only compiled by `scripts/verify-seed.ts`.
- Prisma 7 uses `prisma.config.ts` for the database URL and the JavaScript driver adapter; the full requested model remains intact.
- Self-hosted Judge0 CE is the sole runtime compiler boundary. Missing Judge0 returns a clear service error.
- Private IDs always come from `getServerSession` through `requireUser`; request payloads never select identity.
- Mastery is calculated from the last 50 distinct evidence events, not lesson completion.
- Quiz answers are checked server-side. Code-step evidence requires a real accepted Judge0 run and matching expected output.
- XP uses a database unique event key and transaction-backed insert guard.
- Project files are constrained to safe `.c`/`.h` base names, 20 files, and 500 KB total content.

## Next

1. Run `docker compose up --build` on a machine with a Docker daemon and confirm the migrate/web healthchecks.
2. Run the documented Judge0 and browser/two-account acceptance checklist in an environment with Judge0 services.
3. Add a production-grade distributed rate limiter and retention jobs.
4. Expand World 5–12 lesson/assessment content in the next curriculum milestone.
5. Add adaptive next-action recommendations.
6. Design true multi-translation-unit Judge0 project packaging and linking.
