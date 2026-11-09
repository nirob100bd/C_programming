# CForge

CForge is an interactive C programming and problem-solving platform. It combines a structured curriculum, persistent coding workspaces, isolated GCC execution through Judge0, hidden-test problems, and evidence-based skill mastery.

## Foundation release

The current release includes:

- Credentials accounts with bcrypt password hashes and 30-day JWT sessions.
- User-scoped progress, code snapshots, exact lesson resume, activity history, settings, and JSON export.
- A World 0–10 curriculum slice, a complete skill catalog for Worlds 0–12, achievements, and an in-app C reference.
- Monaco lesson and arena editors plus persistent multi-file project storage.
- Real C compilation through a separately deployed Judge0 CE service—CForge never executes user code in the Next.js process.
- Public examples and private hidden tests, progressive hints, idempotent XP awards, rank progression, weighted mastery evidence, and revision scheduling.
- An interactive pointer/memory laboratory.
- Responsive light/dark UI and keyboard-accessible navigation.
- Unit and route coverage for every API handler and core business-logic module.

See [`STATUS.md`](STATUS.md) for the exact shipped scope and known limitations.

## Prerequisites

- Node.js 20.19+ (Node.js 22 LTS is recommended)
- npm 10+
- PostgreSQL 16+
- Docker with Compose for self-hosted Judge0 CE

## Local setup

1. Install packages:

   ```bash
   npm ci
   ```

2. Create local configuration and generate an auth secret:

   ```bash
   cp .env.example .env
   secret="$(openssl rand -base64 32)"
   # Replace NEXTAUTH_SECRET in .env with the generated value.
   ```

3. Start PostgreSQL (one local option):

   ```bash
   docker run --name cforge-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=cforge \
     -p 5432:5432 \
     -d postgres:16
   ```

4. Apply the committed migration and seed content:

   ```bash
   npm run prisma:generate
   npm run prisma:deploy
   npm run prisma:seed
   ```

5. Start Judge0 by following [`docs/JUDGE0_SETUP.md`](docs/JUDGE0_SETUP.md). Set `JUDGE0_URL` in `.env` only after its API is reachable.

6. Start CForge:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>, create an account, and begin at World 0.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection URL used by Prisma. |
| `NEXTAUTH_SECRET` | Yes | At least 32 random characters for signing session JWTs. |
| `NEXTAUTH_URL` | Production | Canonical application URL. |
| `JUDGE0_URL` | For code execution | Server-only Judge0 base URL; omit it to return a clear HTTP 503. |
| `JUDGE0_API_KEY` | No | Optional value sent to Judge0 as `X-Auth-Token`. |
| `JUDGE0_LANGUAGE_ID` | No | Judge0 C language ID; defaults to `50`. |
| `NEXT_PUBLIC_APP_NAME` | No | Public product name. |

Never commit `.env`. The repository tracks only `.env.example`.

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm start` | Run the production build. |
| `npm run lint` | Run Next.js ESLint rules. |
| `npm run typecheck` | Run strict TypeScript checks. |
| `npm test` | Run Jest unit, route, and component tests. |
| `npm run check` | Lint, typecheck, test, and build. |
| `npm run prisma:generate` | Regenerate the Prisma 7 client. |
| `npm run prisma:migrate -- --name <name>` | Create/apply a development migration. |
| `npm run prisma:deploy` | Apply committed migrations in deployment. |
| `npm run prisma:seed` | Idempotently seed catalog content. |
| `npm run prisma:studio` | Open Prisma Studio. |

## Architecture

- `src/app` — App Router pages and route handlers.
- `src/lib` — auth, API errors, Judge0, XP, mastery, activity, and shared validation.
- `src/generated/prisma` — generated Prisma 7 client checked in for reproducible type/build behavior.
- `prisma/schema.prisma` — complete persistence model.
- `prisma/migrations` — committed PostgreSQL migration history.
- `prisma/seed.ts` — append-friendly idempotent content seed.
- `__tests__` — business logic, all route methods, auth, and shared component tests.
- `docs` — Judge0, deployment, and acceptance-test operations.

### Security boundaries

Protected APIs call `requireUser()`, which calls `getServerSession()` and derives the user ID from the signed server session. Route bodies never choose identity. Queries for private rows include that ID. Password hashes, hidden tests, reference solutions, secrets, and Judge0 credentials are not sent to the browser.

Judge0 is a separate sandbox service. Do not replace it with `child_process`, local GCC execution, or a simulated verdict in Next.js.

## More documentation

- [Judge0 setup](docs/JUDGE0_SETUP.md)
- [Production deployment](docs/DEPLOYMENT.md)
- [Testing and acceptance checks](docs/TESTING.md)
- [Current status](STATUS.md)
- [Agent contribution rules](AGENTS.md)
