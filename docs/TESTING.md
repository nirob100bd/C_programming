# Testing and acceptance

## Fast automated checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The Jest suite is database-independent: Prisma, sessions, and Judge0 are mocked at route boundaries. It covers every exported API method plus auth, API errors, XP idempotency, mastery scoring/deduplication, revision scheduling, Judge0 polling/verdict mapping, validation, activity logging, client HTTP errors, and shared UI states.

Mocks in unit tests are not product fallbacks. Runtime code fails clearly when PostgreSQL or Judge0 is unavailable.

## PostgreSQL checks

With `DATABASE_URL` pointing at a disposable PostgreSQL database:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name verify
npm run prisma:seed
npm run prisma:seed
```

The second seed must complete without duplicate stable-key records. If `migrate dev` reports that no migration is needed, that is expected after the committed initial migration. For CI or production use:

```bash
npm run prisma:deploy
npm run prisma:seed
```

Never run destructive database tests against production.

## Judge0 checks

With `JUDGE0_URL` unset, an authenticated `POST /api/run` must return HTTP 503 and a clear configuration error.

With Judge0 configured:

1. Run `#include <stdio.h>\nint main(void){puts("ok");}` and confirm `Accepted` with stdout `ok`.
2. Submit invalid C and confirm `Compilation Error` with real diagnostics.
3. Submit an infinite loop under a small limit and confirm a time-limit verdict.
4. Solve Elephant with `(x + 4) / 5`; confirm `Accepted`.
5. Solve Elephant with the direct greedy simulation; confirm `Accepted`.
6. Change the output to an incorrect value; confirm `Wrong Answer`.

## Browser acceptance checklist

Use two fresh private-browser profiles for the account-isolation checks.

- [ ] Register an account; inspect PostgreSQL and confirm `passwordHash` is bcrypt, never plaintext.
- [ ] Log out and log in with the same credentials.
- [ ] Dashboard initially shows **Start World 0**.
- [ ] Open a lesson, edit code, wait for **Autosaved**, reload, and confirm step/code restoration.
- [ ] Complete a server-checked quiz; confirm XP is awarded only once after repeated correct submissions.
- [ ] Run a code step with matching output; confirm XP/mastery evidence is recorded once.
- [ ] Submit Elephant with O(1) and simulation solutions; both are accepted by hidden tests.
- [ ] Confirm public problem JSON omits `referenceCode`, `editorial`, and hidden tests.
- [ ] Unlock hints in order; a skipped level returns HTTP 400.
- [ ] Confirm Mastery starts at **Not assessed** and changes only after evidence.
- [ ] Create a project, add `.c`/`.h` files, edit, wait for save, and reload.
- [ ] Change theme/font, reload, and confirm persistence.
- [ ] Export data and open the downloaded JSON.
- [ ] In account A, create a submission, note, and project. Log into account B and confirm all three lists are empty.
- [ ] Delete a disposable account and confirm related rows and progress snapshots are gone.
- [ ] Test narrow mobile and keyboard-only navigation.

## Security regression checks

- Protected handlers must call `requireUser()` before private Prisma access.
- Every private query must include the session-derived `userId` or operate on a row first proven to belong to it.
- No route may accept `userId` as identity from request JSON or query strings.
- Never return password hashes, secrets, hidden test expectations, or reference solutions before final hint unlock.
- Never add `child_process`, `exec`, local GCC, or simulated judging to the Next.js server.
