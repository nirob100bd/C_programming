# CForge production deployment

This guide describes the minimum production topology. It does not turn a development Compose stack into a hardened public judge by itself.

## Topology

Deploy three independent concerns:

1. **CForge web** — the built Next.js Node server.
2. **PostgreSQL** — durable private database storage with backups.
3. **Judge0 CE** — isolated API/workers/database/Redis for untrusted execution.

Only CForge should be public. PostgreSQL must be private. Judge0 should be private and authenticated so browser code cannot bypass CForge authorization and policy.

## Required configuration

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@PRIVATE_DB_HOST:5432/cforge?schema=public&sslmode=require"
NEXTAUTH_SECRET="GENERATE_AT_LEAST_32_RANDOM_CHARACTERS"
NEXTAUTH_URL="https://learn.example.com"
JUDGE0_URL="http://judge0.internal:2358"
JUDGE0_API_KEY="A_JUDGE0_AUTH_TOKEN"
JUDGE0_LANGUAGE_ID="50"
NEXT_PUBLIC_APP_NAME="CForge"
```

Generate secrets with a cryptographically secure tool. Store them in the platform's secret manager, not in an image, Git, logs, or client-visible variables.

## Build and release

```bash
npm ci
npm run prisma:generate
npm run lint
npm run typecheck
npm test
npm run build
npm run prisma:deploy
npm run prisma:seed
npm start
```

`prisma:deploy` applies committed migrations without the interactive development workflow. `prisma:seed` is safe to rerun because catalog records use stable-key upserts; it does not create a default user.

Run migrations as a single release job before scaling new application instances. Back up the database before destructive future migrations.

## Container image

`Dockerfile` builds the Next.js standalone server as its default `runner` target:

```bash
docker build -t cforge:latest .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://learn.example.com" \
  cforge:latest
```

The image contains the build artifacts only; it does not bake in `DATABASE_URL`, `NEXTAUTH_SECRET`, or Judge0 credentials. Build-time placeholders satisfy `src/env.ts` and `prisma.config.ts` while `next build` runs, and every real value must come from the runtime environment.

The `tools` target is the same dependency tree plus the schema and seed, used by the one-shot `migrate` service:

```bash
docker run --rm -e DATABASE_URL="postgresql://..." cforge-tools \
  sh -c "npx prisma generate && npx prisma migrate deploy && npx tsx prisma/seed-run.ts"
```

`docker-compose.yml` wires PostgreSQL, that migration job, and the web container together for local runs. It publishes PostgreSQL on the host, uses development credentials, and omits TLS, so treat it as a developer convenience and not the production topology described below.

## Reverse proxy

Terminate TLS and add, at minimum:

- Per-IP and per-account limits for registration, login, `/api/run`, hints, and submissions.
- Request body limits consistent with CForge's 50 KB source/input and 500 KB project limits.
- A request timeout longer than CForge's bounded Judge0 polling window.
- Access logs that exclude passwords, source bodies, auth cookies, and secret headers.
- Standard forwarding headers and an exact `NEXTAUTH_URL`.

CForge emits `nosniff`, same-origin framing, a strict referrer policy, and a restricted permissions policy. A deployment-specific Content Security Policy should be tested with Monaco before enforcement.

## Database operations

- Use TLS in transit and encrypted volumes.
- Grant the application only the privileges it needs.
- Schedule encrypted backups and test restore procedures.
- Monitor connection count, storage, slow queries, and failed migrations.
- Retain user exports only in the requesting browser; CForge does not persist generated export files.

## Judge isolation

Follow [`JUDGE0_SETUP.md`](JUDGE0_SETUP.md). Judge0 workers execute adversarial code, so place them on dedicated infrastructure where practical. Do not mount application secrets, the Docker socket, source repositories, or host paths into worker sandboxes.

## Health and rollout checks

A deployment check should verify:

1. `/` renders over HTTPS.
2. PostgreSQL accepts a Prisma query.
3. Register/login works and the stored password begins with a bcrypt `$2` prefix.
4. Judge0 direct health and a minimal C submission succeed.
5. An authenticated CForge `/api/run` returns that real verdict.
6. A second account sees none of the first account's submissions/projects/notes.
7. Export downloads valid JSON and account deletion removes user rows.

Roll back the web artifact independently when possible. Do not automatically reverse a database migration unless a tested down migration and data-restoration plan exists.

## Current launch blockers

Before exposing this foundation release to untrusted public traffic:

- Add distributed rate limiting (the repository intentionally does not fake an in-memory production limiter).
- Define retention/pruning for activity, snapshots, and submission source.
- Add observability and alerting.
- Complete a security review of the Judge0 deployment.
- Decide whether project runs should support a true multi-translation-unit build; the current IDE compiles the active `.c` file only.
