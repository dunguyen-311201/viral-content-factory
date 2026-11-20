# Sprint 0 — Implementation Report

Date: 2026-11-20 · Branch: `feat/sprint-0-foundation`

## Outcome
Every Sprint 0 acceptance criterion passes locally:

| Acceptance criterion | Evidence |
| --- | --- |
| `docker compose up -d` starts PostgreSQL and Redis | Both containers report `healthy` (pg_isready / redis-cli ping healthchecks) |
| Web, API and worker start locally | `pnpm dev:api`, `dev:worker` and `dev:web` are all up; status page shows "All systems ready" |
| API health endpoint reports dependency status | `GET /api/v1/health` → 200 with `database`/`redis` `up`; 503 `degraded` when Redis is down (integration-tested) |
| Environment validation fails fast with actionable errors | Bad config → exit 1 with one line per variable and a fix hint (unit-tested; manually verified) |
| CI runs lint/typecheck/tests | `.github/workflows/ci.yml`: lint, typecheck, Prisma validate + migrate deploy, unit, integration, build, prod dependency audit |
| All tests pass | 48 unit tests + 8 integration tests passing |
| `.env` ignored; `.env.example` placeholders only | `.gitignore` ignores `.env` and `.env.*` (except the example); no real values anywhere |

## Architecture choices
- **Modular monolith, pnpm workspaces** (ADR-011; switched from npm at the Project Owner's request after a broken npm lockfile): `apps/api` (NestJS 11), `apps/worker` (plain Node + BullMQ 5), `apps/web` (Next.js 15), `packages/shared`, `packages/ai`. No Nx or Turborepo.
- **Config** (ADR-012): zod schemas per process. `LLM_PROVIDER`/`TTS_PROVIDER` accept only `mock`, which enforces "no paid providers" in code. Production requires a strong `AUTH_SECRET`.
- **Logging and tracing**: pino JSON logs with secret redaction. `x-correlation-id` is validated or generated per request and echoed back, carried via AsyncLocalStorage, put into job payloads and restored in the worker. Request logs record method, path, status and duration only, never bodies or query strings.
- **Errors**: one global filter returns `{ code, message, details?, correlationId }`. 5xx details go to logs, not to clients.
- **Health**: shared `buildHealthReport` with a 2s per-check timeout. API checks PostgreSQL and Redis; the worker also checks that the queue consumer is running. The API boots even while dependencies are down and reports them as `down`.
- **Async pipeline proof**: a dev-only `POST /api/v1/diagnostics/mock-ai-jobs` enqueues a `system-diagnostics` job. The worker runs `MockLlmProvider` and returns provider/model/prompt version/token/latency/cost metadata. `Idempotency-Key` maps to the BullMQ `jobId`, so retries do not duplicate jobs. Enqueue is bounded to 3s, so a Redis outage returns `503 QUEUE_UNAVAILABLE` instead of hanging. Jobs retry three times with exponential backoff.
- **AI boundary** (ADR-007): `LlmProvider` separates trusted `system` from `untrustedInput`. Mock LLM is deterministic and the mock TTS returns a valid silent WAV; both cost 0.
- **Prisma 6** is wired up with no business tables. The first migration arrives with Sprint 1 (sources).
- **Docker Compose** binds ports to `127.0.0.1` only and uses named volumes, with AOF persistence on Redis.

## Commands run and outcomes
| Command | Result |
| --- | --- |
| `docker compose up -d` | postgres and redis healthy |
| `pnpm install` | OK; postinstall ran `prisma generate` and built packages |
| `pnpm lint` | 0 problems |
| `pnpm typecheck` | 0 errors |
| `pnpm test` | 48 passed (shared 24, ai 6, api 9, worker 4, web 5) |
| `pnpm test:integration` | 8 passed (api 6, worker 2) |
| `pnpm exec prisma validate` / `migrate dev` / `migrate deploy` | valid / nothing to migrate |
| `pnpm build` | OK (Next.js production build included) |
| `pnpm audit --prod --audit-level high` | 0 vulnerabilities (after overrides, see ADR-011) |
| Manual smoke: start all three apps, curl health endpoints, enqueue a mock job | 200s, job `completed`, same correlation ID in API and worker logs |
| Manual fail-fast: bad `DATABASE_URL`, `REDIS_URL`, `LLM_PROVIDER=openai` | exit 1 with three actionable lines |

## Known limitations
- **No authentication yet.** HLD requires auth on all routes, but the auth approach is an open Project Owner decision (ADR-010). Health is intentionally public; diagnostics is disabled in production. Auth must land before any product endpoint is exposed beyond localhost.
- No business tables, seed data or `ai_runs` persistence yet. The diagnostic job result lives in Redis only, which is acceptable because it is not business data.
- Web has no ESLint Next.js plugin (kept dependencies minimal); TypeScript and root ESLint still cover it.
- Apps run on the host, not in Compose. Containerizing the apps is deferred until deployment work.
- `test:e2e` does not exist yet, since there is no critical workflow to test until Sprint 4–5.
- Dependency overrides for postcss, effect and deepmerge-ts must be revisited when Next/Prisma ship fixes.
- Verified on Linux (CI-equivalent). Windows uses the same pnpm scripts (no shell-specific syntax), but has not been run on Windows by the agent.

## Recommended Sprint 1 tasks (not started; awaiting Project Owner go-ahead)
1. Decide authentication (ADR-010) and implement single-operator auth plus the `users` table.
2. Source schema and first Prisma migration (provenance, permission, verification, content hash).
3. Source CRUD/archive API with zod DTOs, URL normalization and duplicate detection.
4. Eligibility guard so restricted or rejected sources cannot be used downstream (TEST_STRATEGY invariant 1).
5. Source intake UI.
6. `audit_events` for state transitions, and an `ai_runs` table ready for Sprint 2–3.
