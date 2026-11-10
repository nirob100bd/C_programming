# CForge Implementation Plan

This plan covers the foundation release requested in Steps 2–20. Work remains on the Arena-managed branch `arena/56c6eb0b-c-programming`; the branch name is fixed by the execution environment, so this session will not create or switch to `cforge/foundation`. The final pull request will still target `main` and use the requested foundation title.

## Milestone 1 — Scaffold and tooling

Create files in this order:

1. `package.json` — Next.js, Auth.js/NextAuth, Prisma, UI, validation, and test dependencies plus scripts.
2. `package-lock.json` — generated dependency lockfile.
3. `.gitignore` — Next.js, dependency, build, local database, coverage, and secret exclusions.
4. `.npmrc` — deterministic npm behavior.
5. `tsconfig.json` — strict TypeScript and `@/*` alias.
6. `next-env.d.ts` — Next.js type declarations.
7. `next.config.mjs` — production Next.js configuration.
8. `postcss.config.mjs` — Tailwind/PostCSS configuration.
9. `tailwind.config.ts` — source scanning and theme configuration.
10. `.eslintrc.json` — Next.js lint rules.
11. `jest.config.js` — ts-jest, node/jsdom projects, aliases, and test discovery.
12. `jest.setup.ts` — Testing Library matchers and shared test setup.

## Milestone 2 — Environment and persistence

13. `.env.example` — documented PostgreSQL, auth, and Judge0 configuration.
14. `.env` — local-only generated secret and development defaults (ignored by Git).
15. `src/env.ts` — validated server environment with clear setup errors.
16. `prisma/schema.prisma` — complete CForge data model from the operating manual.
17. `prisma/migrations/20261109170000_init/migration.sql` — reproducible initial PostgreSQL migration.
18. `prisma/migrations/migration_lock.toml` — Prisma provider lock.

## Milestone 3 — Core server libraries

19. `src/lib/prisma.ts` — singleton Prisma client.
20. `src/lib/auth.ts` — credentials auth, JWT session identity, and protected-route helper.
21. `src/types/next-auth.d.ts` — typed session/JWT user identifier augmentation.
22. `src/lib/api.ts` — JSON parsing and consistent API responses/errors.
23. `src/lib/xp.ts` — idempotent XP/rank engine.
24. `src/lib/mastery.ts` — evidence scoring and spaced-revision scheduling.
25. `src/lib/judge.ts` — fail-loud Judge0 execution and test judging.
26. `src/lib/activity.ts` — activity audit logging.
27. `src/lib/utils.ts` — class merging and integer ceiling division.
28. `src/lib/validation.ts` — reusable query/body validation and bounds.
29. `src/lib/http.ts` — safe client fetch helper and typed API errors.

## Milestone 4 — Authentication and account APIs

30. `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handlers.
31. `src/app/api/register/route.ts` — validated registration and initial XP.
32. `src/app/api/me/route.ts` — profile read/update.
33. `src/app/api/export/route.ts` — authenticated data export.
34. `src/app/api/delete-account/route.ts` — authenticated account deletion.

## Milestone 5 — Curriculum, progress, and learning APIs

35. `src/app/api/lessons/route.ts` — lesson catalog.
36. `src/app/api/lesson/[lessonId]/route.ts` — lesson details.
37. `src/app/api/progress/route.ts` — authenticated autosave/snapshots.
38. `src/app/api/progress/recent/route.ts` — exact resume payload.
39. `src/app/api/mastery/route.ts` — skill state and due revisions.
40. `src/app/api/achievements/route.ts` — achievement catalog and earned state.
41. `src/app/api/activity/route.ts` — bounded activity history.

## Milestone 6 — Judge, submissions, and arena APIs

42. `src/app/api/run/route.ts` — authenticated Judge0 run endpoint.
43. `src/app/api/submissions/route.ts` — user-scoped submission history.
44. `src/app/api/submissions/[id]/route.ts` — user-scoped submission details.
45. `src/app/api/problems/route.ts` — validated problem filters.
46. `src/app/api/problems/[slug]/route.ts` — safe public problem detail without solutions.
47. `src/app/api/problems/[slug]/submit/route.ts` — hidden-test judging, XP, and mastery evidence.
48. `src/app/api/problems/[slug]/hint/route.ts` — authenticated progressive hints.

## Milestone 7 — Notes, bookmarks, reference, and project APIs

49. `src/app/api/notes/route.ts` — user-scoped list/create.
50. `src/app/api/notes/[id]/route.ts` — user-scoped update/delete.
51. `src/app/api/bookmarks/route.ts` — user-scoped list/upsert/delete.
52. `src/app/api/reference/route.ts` — searchable reference catalog.
53. `src/app/api/reference/[slug]/route.ts` — reference detail.
54. `src/app/api/projects/route.ts` — user-scoped project list/create.
55. `src/app/api/projects/[id]/route.ts` — user-scoped project read/update/delete.

## Milestone 8 — App shell, visual system, and authentication UI

56. `src/app/globals.css` — responsive light/dark design system, accessibility, and components.
57. `src/app/layout.tsx` — root metadata/providers.
58. `src/components/Providers.tsx` — session and persistent theme provider.
59. `src/components/Nav.tsx` — responsive authenticated navigation.
60. `src/components/Logo.tsx` — accessible CForge wordmark.
61. `src/components/LoadingState.tsx` — shared loading skeleton.
62. `src/components/ErrorState.tsx` — shared actionable error state.
63. `src/components/EmptyState.tsx` — shared empty state.
64. `src/components/CodeEditor.tsx` — reusable client-only Monaco wrapper.
65. `src/app/page.tsx` — polished landing page.
66. `src/app/login/page.tsx` — credentials login.
67. `src/app/register/page.tsx` — account registration.
68. `src/app/(app)/layout.tsx` — protected-area shell.

## Milestone 9 — Product pages

69. `src/app/(app)/dashboard/page.tsx` — XP, resume, skill, revision, and submission overview.
70. `src/app/(app)/worlds/page.tsx` — ordered curriculum map.
71. `src/app/(app)/learn/[lessonId]/page.tsx` — multi-step lesson, autosave, quizzes, and GCC runs.
72. `src/app/(app)/ide/page.tsx` — persistent multi-file project workspace.
73. `src/app/(app)/arena/page.tsx` — problem discovery and filters.
74. `src/app/(app)/arena/[slug]/page.tsx` — statement, hints, editor, and hidden-test submission.
75. `src/app/(app)/mastery/page.tsx` — skill mastery and revision view.
76. `src/app/(app)/history/page.tsx` — activity history.
77. `src/app/(app)/reference/page.tsx` — searchable C reference.
78. `src/app/(app)/reference/[slug]/page.tsx` — reference article detail.
79. `src/app/(app)/projects/page.tsx` — project overview and IDE entry.
80. `src/app/(app)/settings/page.tsx` — profile/theme/font, export, and deletion controls.
81. `src/app/(app)/labs/pointers/page.tsx` — interactive pointer/memory laboratory.
82. `src/app/not-found.tsx` — helpful 404 page.
83. `src/middleware.ts` — route-level sign-in redirect as defense in depth.

## Milestone 10 — Seed curriculum and challenge content

84. `prisma/seed.ts` — idempotent skills, achievements, references, Worlds 0–10 lessons, and judged problems; `prisma/seed-run.ts` is the CLI entry point.
84a. `scripts/verify-seed.ts` — offline GCC verifier for lesson exercises and problem reference solutions.
84b. `__tests__/curriculum.test.ts` and `__tests__/achievements.test.ts` — catalog integrity and achievement-rule coverage.

The seed is append-only in structure: content constants are independent and every entity is upserted. Hidden test cases are synchronized without exposing expected output through public APIs.

## Milestone 11 — Automated tests

85. `__tests__/helpers/mock-prisma.ts` — typed/resettable Prisma mock.
86. `__tests__/helpers/requests.ts` — request and response test helpers.
87. `__tests__/api.test.ts` — parsing/error response behavior.
88. `__tests__/auth.test.ts` — password and credentials authorization behavior without a live database.
89. `__tests__/xp.test.ts` — rank boundaries and idempotent XP behavior.
90. `__tests__/mastery.test.ts` — weighted evidence/state and revision behavior.
91. `__tests__/judge.test.ts` — Judge0 configuration, polling, verdict, and test comparison behavior.
92. `__tests__/utils.test.ts` — utility edge cases.
93. `__tests__/routes-account.test.ts` — register, me, export, and delete-account routes.
94. `__tests__/routes-learning.test.ts` — lessons, progress, recent, mastery, achievements, and activity routes.
95. `__tests__/routes-judge.test.ts` — run, submissions, problems, submit, and hint routes.
96. `__tests__/routes-content.test.ts` — notes, bookmarks, reference, and project routes.
97. `__tests__/components.test.tsx` — shell/common component behavior.
98. `src/app/(app)/achievements/page.tsx` — earned/locked achievement grid.

Every exported API method and every core business-logic function receives automated coverage. Database-independent unit tests mock Prisma; migration/seed smoke checks are documented separately because they require PostgreSQL.

## Milestone 12 — Operations and documentation

98. `README.md` — product overview, quick start, scripts, architecture, and current scope.
99. `docs/JUDGE0_SETUP.md` — isolated Judge0 CE deployment and verification.
100. `docs/DEPLOYMENT.md` — production PostgreSQL/Judge0, secrets, migrations, rate-limit expectations, and checks.
101. `docs/TESTING.md` — unit, build, migration, seed, and manual acceptance procedures.
102. `STATUS.md` — Done / In progress / Known issues / Decisions / Next.
103. `AGENTS.md` — concise repository operating guide for future coding sessions.

## Milestone 13 — Verification, commits, and pull request

1. Generate Prisma client and validate/format the schema.
2. Run unit/route/component tests, lint, TypeScript checks, and production build.
3. Run migration and seed against PostgreSQL if a local service is available; otherwise retain the generated migration and record the exact external-service blocker without substituting a fake database.
4. Verify Judge0’s fail-loud behavior without configuration; exercise real compilation only if Judge0 is reachable.
5. Review `git diff`, secret exclusions, API authorization, and hidden-test/solution exposure.
6. Create small `type: subject` commits on the fixed Arena branch, running the test suite before each commit.
7. Push only `arena/56c6eb0b-c-programming` and open one pull request to `main` titled **CForge v1 — Foundation, Auth, Curriculum Slice, Judge0, Mastery Skeleton**.
