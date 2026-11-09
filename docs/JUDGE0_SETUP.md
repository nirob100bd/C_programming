# Judge0 CE setup

CForge delegates all untrusted C execution to a separate Judge0 CE deployment. Never install a direct GCC execution path in the Next.js application.

## Local Docker deployment

Judge0's own release configuration is the source of truth. A pinned local setup can be prepared with:

```bash
git clone --depth 1 --branch v1.13.0 https://github.com/judge0/judge0.git
cd judge0
cp judge0.conf judge0.conf.local 2>/dev/null || true
```

Open `judge0.conf` and replace every default database/Redis password with generated values. Then follow the Compose commands provided by that tagged release. A typical release flow is:

```bash
docker compose up -d db redis
# Wait until both dependencies are healthy.
docker compose up -d
docker compose ps
curl --fail http://localhost:2358/about
curl --fail http://localhost:2358/languages
```

Judge0 is a substantial service; dependency health can take longer than a fixed sleep. Use `docker compose ps` and service logs rather than assuming readiness.

## CForge configuration

Set these server-only values in CForge's `.env`:

```dotenv
JUDGE0_URL="http://localhost:2358"
JUDGE0_API_KEY=""
JUDGE0_LANGUAGE_ID="50"
```

Language ID `50` is the default C (GCC) image in the pinned Judge0 release. Confirm it in `/languages`; if your deployment maps C to another ID, update `JUDGE0_LANGUAGE_ID`.

When `JUDGE0_API_KEY` is nonempty, CForge sends it as `X-Auth-Token`. Do not prefix it with `Bearer` and do not expose it through a `NEXT_PUBLIC_` variable.

## Verification

Submit a minimal program directly before testing CForge:

```bash
curl --fail --request POST \
  --header 'Content-Type: application/json' \
  --data '{
    "language_id": 50,
    "source_code": "#include <stdio.h>\nint main(void){puts(\"ok\");return 0;}",
    "stdin": ""
  }' \
  'http://localhost:2358/submissions?base64_encoded=false&wait=true'
```

The JSON response should have status ID `3` and stdout `ok\n`.

Then sign in to CForge and call `/api/run` from the lesson or IDE. CForge creates an asynchronous Judge0 submission, polls it with a bounded deadline, and stores the real verdict.

## Failure behavior

- No `JUDGE0_URL`: `/api/run` returns HTTP 503 with a setup message.
- Network/auth failure: HTTP 503; no verdict is fabricated.
- Polling deadline exceeded: HTTP 504.
- Compilation, runtime, time-limit, and wrong-answer results remain Judge0/judging verdicts, not transport errors.

## Production hardening

- Keep Judge0 on a private network reachable by the CForge server, not by browsers.
- Use Judge0 authentication and set `JUDGE0_API_KEY`.
- Do not run privileged containers.
- Apply CPU, memory, process, output, and network limits at the Judge0/container layer.
- Disable outbound networking for submission workers unless a deliberate task requires it.
- Patch the host, Docker runtime, and Judge0 release regularly.
- Rate-limit CForge `/api/run` and problem submission endpoints at the reverse proxy before public launch.
- Monitor queue depth, worker health, timeouts, and internal-error verdicts.
