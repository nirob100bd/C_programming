# CForge

CForge is an interactive C programming and problem-solving platform. It combines a structured curriculum, persistent coding workspaces, isolated GCC execution through Judge0, hidden-test problems, and evidence-based skill mastery.

## Foundation release

The current release includes:

- Credentials accounts with bcrypt password hashes and 30-day JWT sessions.
- User-scoped progress, code snapshots, exact lesson resume, activity history, settings, and JSON export.
- A deep Worlds 0–4 curriculum (30 lessons, 104 steps), a complete skill catalog for Worlds 0–12, 18 judged problems, 36 data-driven achievements, and a 50-entry C standard library reference.
- Monaco lesson and arena editors plus persistent multi-file project storage.
- Real C compilation through an isolated Judge0 CE sandbox service (bundled in `docker-compose.yml`)—CForge never executes user code in the Next.js process.
- Public examples and private hidden tests, progressive hints, idempotent XP awards, rank progression, weighted mastery evidence, and revision scheduling.
- Two interactive laboratories: a stack/heap pointer simulator (`malloc`, `free`, dangling and double-free demos) and a step-through algorithm visualizer for bubble sort, binary search, and breadth-first search that plays back the real frames the algorithms visit.
- Responsive light/dark UI and keyboard-accessible navigation.
- Unit and route coverage for every API handler and core business-logic module.

See [`STATUS.md`](STATUS.md) for the exact shipped scope and known limitations.

## Prerequisites

- Docker with Compose (`docker-compose` or `docker compose`) for the one-command full stack (App + Database + Judge0 Compiler)
- Or, for manual local development outside Docker: Node.js 20.19+ (Node.js 22 LTS recommended), npm 10+, and PostgreSQL 16+

## Run with Docker (recommended)

The repository ships a `Dockerfile` and a full-stack `docker-compose.yml` that bring up **the entire stack (App + Database + Compiler)**—CForge's Next.js server, PostgreSQL with committed migrations and content seed, and a full Judge0 CE v1.13.1 compiler cluster—on a single private Docker network (`cforge-net`).

You only need to run one command:

```bash
docker-compose up -d --build
```

(If you use the Compose v2 CLI plugin, `docker compose up -d --build` works identically.)

Then open <http://localhost:3000>, create an account, and begin at World 0. No manual Judge0 setup or Windows/WSL2 cgroup PowerShell script is required—`docker-compose.yml` wires `JUDGE0_URL=http://judge0-server:2358` automatically and enables Judge0's cgroup-v2 compatibility flags for Docker Desktop.

What the stack contains:

| Service | Role |
| --- | --- |
| `db` | PostgreSQL 16 with a named `cforge-db` volume, health-checked before migrations run. |
| `migrate` | One-shot `prisma generate` + `prisma migrate deploy` + content seed. Exits cleanly before `web` starts. |
| `judge0-db` | Dedicated PostgreSQL 16 database (`judge0-db` volume) for Judge0 CE submissions and languages. |
| `judge0-redis` | Password-protected Redis 7 queue backing Judge0 background grading jobs. |
| `judge0-server` | Judge0 CE v1.13.1 HTTP API on the private `cforge-net` network (also mapped to port `2358` for local verification/`npm run dev`). |
| `judge0-workers` | Judge0 CE v1.13.1 sandbox workers with `ENABLE_PER_PROCESS_AND_THREAD_TIME_LIMIT=true` and `ENABLE_PER_PROCESS_AND_THREAD_MEMORY_LIMIT=true` for Windows/WSL2 cgroup-v2 compatibility. |
| `web` | The `output: "standalone"` Next.js server on port `3000`, connected to `db` and `judge0-server` on `cforge-net`. |

Useful variants:

```bash
# Rebuild and start the entire stack in the background
docker-compose up -d --build

# Follow app and compiler logs
docker-compose logs -f web judge0-server judge0-workers

# Re-run migrations/seed on demand (for example after pulling new content)
docker-compose run --rm migrate

# Stop everything but keep database volumes
docker-compose down

# Stop everything and delete local database volumes
docker-compose down -v
```

Configuration: `docker-compose.yml` sets `DATABASE_URL` (`db:5432`) and `JUDGE0_URL` (`http://judge0-server:2358`) automatically for container-to-container communication on `cforge-net`, so no `.env` file is required to boot the Docker stack. If you copy `.env.example` to `.env` or export variables in your shell, Compose forwards `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `JUDGE0_API_KEY` (wired to Judge0's `AUTHN_TOKEN`), `JUDGE0_LANGUAGE_ID`, and `NEXT_PUBLIC_APP_NAME`; for anything beyond local experimentation, set a real 32+ character `NEXTAUTH_SECRET` and a strong `JUDGE0_API_KEY`. This stack is a convenience for local runs, not a hardened production deployment—see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) and [`docs/JUDGE0_SETUP.md`](docs/JUDGE0_SETUP.md).

## Local setup (outside Docker)

If you prefer to run the Next.js server directly with `npm run dev` on your host:

1. Install packages:

   ```bash
   npm ci
   ```

2. Create local configuration and generate an auth secret:

   ```bash
   cp .env.example .env
   secret="$(openssl rand -base64 32)"
   # Replace NEXTAUTH_SECRET in .env with the generated value.
   # Because you are running outside Docker, update JUDGE0_URL in .env to:
   #   JUDGE0_URL="http://localhost:2358"
   ```

3. Start PostgreSQL (either via `docker-compose up -d db` or a standalone container):

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

5. Start Judge0 (for example `docker-compose up -d judge0-db judge0-redis judge0-server judge0-workers` or follow [`docs/JUDGE0_SETUP.md`](docs/JUDGE0_SETUP.md)) and verify `JUDGE0_URL="http://localhost:2358"` in `.env`.

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
| `JUDGE0_URL` | For code execution | Server-only Judge0 base URL (`http://judge0-server:2358` in `docker-compose.yml`, `http://localhost:2358` for `npm run dev`); omit it to return a clear HTTP 503. |
| `JUDGE0_API_KEY` | No | Optional value sent to Judge0 as `X-Auth-Token` (and forwarded as `AUTHN_TOKEN` in Compose). |
| `JUDGE0_LANGUAGE_ID` | No | Judge0 C language ID; defaults to `50`. |
| `NEXT_PUBLIC_APP_NAME` | No | Public product name. |

Never commit `.env`. The repository tracks only `.env.example`.

## Commands

| Command | Action |
| --- | --- |
| `docker-compose up -d --build` | Build and start the entire stack (CForge web + PostgreSQL + migrations/seed + Judge0 CE compiler). |
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
| `npm run verify:content` | Compile and run every reference solution and lesson exercise with local GCC (no Judge0 or database needed). |
| `npm run prisma:studio` | Open Prisma Studio. |

## Architecture

- `src/app` — App Router pages and route handlers.
- `src/lib` — auth, API errors, Judge0, XP, mastery, activity, and shared validation.
- `src/generated/prisma` — generated Prisma 7 client checked in for reproducible type/build behavior.
- `prisma/schema.prisma` — complete persistence model.
- `prisma/migrations` — committed PostgreSQL migration history.
- `prisma/seed.ts` — append-friendly idempotent content catalog (importable, no side effects); `prisma/seed-run.ts` is the CLI entry point.
- `scripts/verify-seed.ts` — offline curriculum verifier: compiles every reference program with GCC and checks all declared expected output.
- `__tests__` — business logic, all route methods, auth, and shared component tests.
- `Dockerfile` / `docker-compose.yml` — production image plus a full-stack Compose setup (CForge web, PostgreSQL, migrate/seed, and Judge0 CE).
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
