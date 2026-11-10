# Judge0 CE setup

CForge delegates all untrusted C execution to a separate Judge0 CE deployment. Never install a direct GCC execution path in the Next.js application.

> **Included in `docker-compose.yml`:** Judge0 CE (`v1.13.1`)—including `judge0-db`, `judge0-redis`, `judge0-server`, and `judge0-workers`—is now built directly into the repository's root `docker-compose.yml` on the shared `cforge-net` private network, with the Windows/WSL2 cgroup-v2 workaround already applied. For most local runs you only need `docker-compose up -d --build` from the project root and do not need to clone or configure Judge0 separately.

## Windows / WSL2 & cgroup v2 workaround (`/box/main.c` error)

### Symptom

On Docker Desktop for Windows (WSL2 backend) and modern Linux distributions that mount **cgroup v2** exclusively, Judge0 CE 1.13.x containers start normally, but every submission fails with **Internal Error** (`status.id = 13`) and an error message such as:

```text
No such file or directory @ rb_sysopen - /box/main.c
```

Worker logs often also show `isolate` failing with:

```text
Failed to create control group /sys/fs/cgroup/memory/box-*/: No such file or directory
chown: cannot access '/box': No such file or directory
```

### Root cause

Judge0 CE 1.13.x uses the `isolate` sandbox. By default (`ENABLE_PER_PROCESS_AND_THREAD_TIME_LIMIT=false` and `ENABLE_PER_PROCESS_AND_THREAD_MEMORY_LIMIT=false`), Judge0 invokes `isolate --cg`, which requires a **cgroup v1** hierarchy at `/sys/fs/cgroup/memory`. Because Docker Desktop on WSL2 (and modern Linux kernels) uses unified cgroup v2, `isolate --cg --init` fails and returns an empty working directory, causing Judge0 to build `/box/main.c` instead of `<workdir>/box/main.c`.

### Fix (preconfigured in `docker-compose.yml`)

Set **both** environment variables to `true` on the Judge0 `server` and `workers` services (or in `judge0.conf` when deploying Judge0 standalone):

```dotenv
ENABLE_PER_PROCESS_AND_THREAD_TIME_LIMIT=true
ENABLE_PER_PROCESS_AND_THREAD_MEMORY_LIMIT=true
```

When both flags are `true`, Judge0 omits `--cg`, `--cg-timing`, and `--cg-mem` and instructs `isolate` to enforce per-process/thread CPU (`-t`) and memory (`-m`) limits directly. This avoids the cgroup v1 requirement without manual PowerShell setup or WSL kernel modifications.

> **Production Linux note:** If you deploy Judge0 on a dedicated Linux host configured for cgroup v1 (`systemd.unified_cgroup_hierarchy=0`) and want cgroup-wide resource accounting across multi-process submissions, set both variables back to `false`.

## Standalone Docker deployment (optional)

If you prefer to manage Judge0 outside CForge's `docker-compose.yml`, Judge0's own release configuration is the source of truth. A pinned standalone setup can be prepared with:

```bash
git clone --depth 1 --branch v1.13.1 https://github.com/judge0/judge0.git
cd judge0
cp judge0.conf judge0.conf.local 2>/dev/null || true
```

Open `judge0.conf`, replace every default database/Redis password with generated values, and enable the cgroup-v2 workaround above if your host uses cgroup v2. Then start the stack:

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

- **Inside Docker Compose (`docker-compose.yml`):** The `web` service automatically uses `JUDGE0_URL="http://judge0-server:2358"` over the private `cforge-net` network.
- **Local `npm run dev` outside Docker:** Set `JUDGE0_URL="http://localhost:2358"` in your local `.env` (the Compose stack exposes `judge0-server` on port `2358` for host access):

```dotenv
JUDGE0_URL="http://localhost:2358"
JUDGE0_API_KEY=""
JUDGE0_LANGUAGE_ID="50"
```

Language ID `50` is the default `C (GCC 9.2.0)` image in the pinned Judge0 release. Confirm it in `/languages`; if your deployment maps C to another ID, update `JUDGE0_LANGUAGE_ID`.

When `JUDGE0_API_KEY` is nonempty, CForge sends it as `X-Auth-Token` (and `docker-compose.yml` forwards it to `judge0-server` as `AUTHN_TOKEN`). Do not prefix it with `Bearer` and do not expose it through a `NEXT_PUBLIC_` variable.

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

- Keep Judge0 on a private network reachable by the CForge server, not by browsers (and omit the host port mapping `2358:2358` when deploying publicly).
- Use Judge0 authentication (`AUTHN_TOKEN`) and set `JUDGE0_API_KEY`.
- Do not mount application secrets, the Docker socket, or host paths into Judge0 worker containers.
- Apply CPU, memory, process, output, and network limits at the Judge0/container layer.
- Disable outbound networking for submission workers unless a deliberate task requires it.
- Patch the host, Docker runtime, and Judge0 release regularly.
- Rate-limit CForge `/api/run` and problem submission endpoints at the reverse proxy before public launch.
- Monitor queue depth, worker health, timeouts, and internal-error verdicts.
