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
- [x] Seed catalog: 78 skills, 12 achievements, 12 reference entries, 20 foundation lessons, Elephant and Sum problems
- [x] Quiz answers/reference solutions/hidden tests withheld from ordinary public payloads
- [x] Automated tests for every API method and all core business logic (71 passing tests at last update)
- [x] README plus Judge0, deployment, and testing documentation
- [x] Live PostgreSQL 18 verification: initial migration deployed, the seed completed twice idempotently, and persisted counts matched 78 skills, 12 achievements, 12 reference entries, 20 lessons, and 2 problems

## In progress

- [ ] Expand lesson depth across Worlds 2–12; the schema and skill graph are complete, but the foundation seed is a curriculum slice
- [ ] Adaptive recommendation engine beyond weakest-skill and due-revision displays
- [ ] Achievement auto-awarding rules (achievement definitions are seeded)
- [ ] Full pointer lab v2 with stack frames, arrays, pointer arithmetic, ownership, and allocator scenarios
- [ ] Algorithm visualizers and trace/prediction evidence UI
- [ ] Contest sessions and optimized-solution mode

## Known issues

- Distributed rate limiting is not implemented. Add it at the reverse proxy/application layer before public deployment.
- Hidden tests run sequentially through Judge0, favoring simple correctness and isolation over throughput.
- The IDE persists multiple files but compiles only the active `.c` translation unit; it does not pretend to provide a multi-file linker yet.
- `Progress.completed` is lesson-level, so per-step completion checkmarks are not persisted independently.
- Activity and progress snapshots need a production retention/pruning policy.
- No Judge0 daemon is available in this workspace, so real compilation and the browser/two-account acceptance flows that depend on judging remain external-service verification tasks. Unit/route tests do not simulate Judge0.

## Decisions made

- The Arena-managed branch name is fixed; all foundation work remains on `arena/56c6eb0b-c-programming` rather than creating `cforge/foundation`.
- Prisma 7 uses `prisma.config.ts` for the database URL and the JavaScript driver adapter; the full requested model remains intact.
- Self-hosted Judge0 CE is the sole runtime compiler boundary. Missing Judge0 returns a clear service error.
- Private IDs always come from `getServerSession` through `requireUser`; request payloads never select identity.
- Mastery is calculated from the last 50 distinct evidence events, not lesson completion.
- Quiz answers are checked server-side. Code-step evidence requires a real accepted Judge0 run and matching expected output.
- XP uses a database unique event key and transaction-backed insert guard.
- Project files are constrained to safe `.c`/`.h` base names, 20 files, and 500 KB total content.

## Next

1. Run the documented Judge0 and browser/two-account acceptance checklist in an environment with Judge0 services.
2. Add a production-grade distributed rate limiter and retention jobs.
3. Expand World 2–12 lesson/assessment content in the curriculum milestone.
4. Add achievement evaluation and adaptive next-action recommendations.
5. Design true multi-translation-unit Judge0 project packaging and linking.
