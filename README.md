# Viral Content Factory

> AI-assisted content research and production system for owned Vietnamese social channels.
> Status: **Sprint 0 (foundation) implemented** | Docs baseline v1.0 | Owner: Project Owner

## What this project does
Viral Content Factory turns topic signals and permitted source material into original, reviewed, faceless social content. It supports a human-approved workflow from source intake to trend analysis, brief, script, quality review, media production, publishing record, and performance learning.

## Product boundaries
- Initial market: Vietnam; Vietnamese-language content.
- Initial niche: relationships, workplace stories, social psychology, and public-interest social discussion.
- Initial channels: TikTok and Facebook Reels; YouTube Shorts is a later distribution target.
- Business model: owned channels first; affiliate/sponsorship/digital products only after audience validation.
- Automation: balanced. AI performs research assistance and drafting; a human approves sensitive content and publishing.
- Monthly operating budget target: under VND 3,000,000 during validation. This is a planning constraint, not a guarantee.
- MVP is an internal tool for one owner/operator, not a multi-tenant SaaS.

---

## Local development

### Prerequisites
- **Node.js 22 LTS** (`>= 22.12`; see `.nvmrc`) and npm 10+.
- **Docker Desktop** (or Docker Engine) with Docker Compose v2.
- Free local ports: 3000 (web), 4000 (API), 4001 (worker health), 5432 (PostgreSQL), 6379 (Redis).

No real credentials or paid providers are needed. LLM and TTS run on built-in mock providers.

### Quick start
```bash
# 1. Configuration (placeholders only; never commit .env)
cp .env.example .env            # Windows (cmd/PowerShell): copy .env.example .env

# 2. Infrastructure: PostgreSQL + Redis
docker compose up -d
docker compose ps               # both services should become "healthy"

# 3. Dependencies (also generates the Prisma client and builds packages/*)
npm install

# 4. Database migrations (none yet in Sprint 0; safe to run)
npm run db:migrate

# 5. Start each app in its own terminal
npm run dev:api                 # http://localhost:4000/api/v1/health
npm run dev:worker              # http://localhost:4001/health
npm run dev:web                 # http://localhost:3000
```

### Verify it works
```bash
# API readiness: 200 + database/redis "up" (503 "degraded" if one is down)
curl -i http://localhost:4000/api/v1/health

# Worker readiness
curl http://localhost:4001/health

# End-to-end mock AI job: API → Redis/BullMQ → worker → mock LLM
curl -X POST http://localhost:4000/api/v1/diagnostics/mock-ai-jobs \
  -H "content-type: application/json" -H "x-correlation-id: manual-check-01" \
  -d '{"input":"Xin chào"}'
# → {"jobId":"…","status":"queued","correlationId":"manual-check-01"}
curl http://localhost:4000/api/v1/diagnostics/mock-ai-jobs/<jobId>
# → "state":"completed", "result":{"provider":"mock", … "estimatedCostVnd":0}
```
Open http://localhost:3000 and the status page shows **All systems ready**. The same `correlationId` appears in the API and worker log lines for that job.

On Windows PowerShell, use `curl.exe` instead of `curl`, or use `Invoke-RestMethod`.

### Commands
| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint across the whole repo |
| `npm run typecheck` | `tsc --noEmit` in every workspace |
| `npm test` | Unit tests (no services needed) |
| `npm run test:integration` | Integration tests against real PostgreSQL + Redis (`docker compose up -d` first) |
| `npm run build` | Production build of packages, API, worker and web |
| `npm run db:validate` / `db:migrate` / `db:deploy` | Prisma schema validation / dev migrations / apply migrations |
| `npm run services:up` / `services:down` | Start / stop PostgreSQL and Redis |

### Repository layout
```text
apps/
  api/        NestJS REST API under /api/v1 (health, diagnostics; product modules from Sprint 1)
  worker/     BullMQ worker process + /health endpoint
  web/        Next.js operator UI (Sprint 0: status page only)
packages/
  shared/     env validation (zod), structured logging (pino), correlation IDs, health checks, queue names
  ai/         LLM + TTS provider interfaces and mock providers
prisma/       Prisma schema (no business tables yet) and future migrations
docs/         Product, architecture, operations and sprint documentation
docker-compose.yml   PostgreSQL 16 + Redis 7, bound to 127.0.0.1 only
.github/workflows/ci.yml   lint, typecheck, Prisma validation, unit + integration tests, build, audit
```

### Troubleshooting
| Symptom | Fix |
| --- | --- |
| `[api] Invalid environment configuration: …` and exit code 1 | Startup fails fast on purpose. Create `.env` from `.env.example` at the repository root and fix each listed variable. |
| `LLM_PROVIDER: is not supported` | Only `mock` is allowed until the Project Owner approves a real provider. |
| `/api/v1/health` returns 503 with `database: down` | PostgreSQL is not running or `DATABASE_URL` is wrong. Run `docker compose ps` and `docker compose logs postgres`. |
| `/api/v1/health` returns 503 with `redis: down` | Run `docker compose up -d redis` and check `REDIS_URL`. |
| `port is already allocated` from Docker | Another Postgres or Redis is already running. Stop it, or set `POSTGRES_PORT` / `REDIS_PORT` in `.env` and update `DATABASE_URL` / `REDIS_URL` to match. |
| `EADDRINUSE` for 3000/4000/4001 | Change `API_PORT` / `WORKER_HEALTH_PORT`, or stop the other process. |
| `Cannot find module '@vcf/shared'` or `@prisma/client did not initialize` | Run `npm install` again (its postinstall builds `packages/*` and runs `prisma generate`), or run `npm run build:packages && npm run db:generate`. |
| Mock job stays `waiting` | The worker is not running. Start `npm run dev:worker` and check `http://localhost:4001/health`. |
| Integration tests fail to connect | Start the services first: `docker compose up -d`. |
| Reset local data | `docker compose down -v` deletes the local PostgreSQL and Redis volumes. **This cannot be undone.** |

---

## Read order for Claude Code
1. `PROJECT_CONSTITUTION.md`
2. `AGENTS.md`
3. `docs/business/PRD.md`
4. `docs/product/USER_STORIES.md`
5. `docs/architecture/HLD.md`
6. `docs/architecture/ERD.md`
7. `docs/architecture/ADR.md`
8. `docs/ai/AI_SYSTEM.md`
9. `docs/operations/SECURITY_AND_COMPLIANCE.md`
10. The active sprint file under `docs/sprints/`

Do not load every file for every task. Load the constitution, agent rules, relevant domain docs, and current sprint only.

## Repository status
Sprint 0 (foundation) is implemented. See `docs/sprints/SPRINT_0_REPORT.md`. Product features start in Sprint 1, after the Project Owner explicitly asks to continue.

## Definition of project success
Within the first 8 weeks:
- Complete a usable single-operator MVP.
- Process manually submitted source URLs and permitted source records.
- Generate structured trend briefs and original scripts.
- Enforce human review and approval before publication.
- Produce repeatable short-video assets using templates, TTS, subtitles, and FFmpeg.
- Record publishing metadata and basic performance metrics.
- Test at least 30 published content pieces if quality and operational capacity allow; optimize based on actual performance, not vanity metrics.
