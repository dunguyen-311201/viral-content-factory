# Deployment and Environment

## Environments
- `local`: Docker Compose; fake/test providers by default.
- `staging`: optional; use test keys and synthetic data.
- `production`: only after security checklist and backup restore test.

## Suggested repository layout
```text
viral-content-factory/
├── apps/
│   ├── web/                 # Next.js
│   ├── api/                 # NestJS REST API
│   └── worker/              # BullMQ processors
├── packages/
│   ├── shared/              # shared types/schemas
│   ├── ai/                  # provider adapters and prompt loader
│   └── media/               # TTS/FFmpeg pipeline
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── prompts/
│   ├── trend-scout/
│   ├── trend-analyst/
│   ├── content-writer/
│   ├── quality-reviewer/
│   └── media-scene-planner/
├── docs/
├── scripts/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Environment variables (names only)
```dotenv
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vcf
REDIS_URL=redis://localhost:6379
AUTH_SECRET=replace_me
LLM_PROVIDER=mock
LLM_API_KEY=
LLM_MODEL=
TTS_PROVIDER=mock
TTS_API_KEY=
TTS_VOICE=
MEDIA_STORAGE_DRIVER=local
MEDIA_STORAGE_PATH=./storage/media
MONTHLY_BUDGET_VND=3000000
APP_TIMEZONE=Asia/Ho_Chi_Minh
# Added in Sprint 0
LOG_LEVEL=info
API_PORT=4000
WORKER_HEALTH_PORT=4001
WORKER_CONCURRENCY=2
QUEUE_PREFIX=vcf
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=vcf
```

Validation rules (Sprint 0): `DATABASE_URL` must be a `postgresql://` URL, and `REDIS_URL` must be a `redis://` URL. `LLM_PROVIDER` and `TTS_PROVIDER` accept only `mock`. In production, `AUTH_SECRET` must be at least 32 characters and not the placeholder. Empty values fall back to defaults. `.env` is loaded from the repository root, and real environment variables take precedence.

## Health endpoints
| Process | Liveness | Readiness (dependency status; 503 when degraded) |
| --- | --- | --- |
| API | `GET /api/v1/health/live` | `GET /api/v1/health` (database, redis) |
| Worker | `GET :4001/health/live` | `GET :4001/health` (database, redis, queue) |
| Web | `GET /api/health` | status page `/` shows API dependency status |

The development-only `POST /api/v1/diagnostics/mock-ai-jobs` endpoint is not registered when `NODE_ENV=production`.

Never commit real values. `.env.example` must contain placeholders only.

## Local setup checklist
- Install supported Node.js LTS and package manager.
- Copy `.env.example` to `.env`.
- Start PostgreSQL and Redis with Docker Compose.
- Install dependencies.
- Run Prisma migrations.
- Seed a local operator and safe demo data (from Sprint 1, when the first tables exist).
- Start web, API, and worker.
- Verify health endpoints and a mock AI job.

## Production readiness checklist
- [ ] HTTPS and secure cookies.
- [ ] Firewall and non-root runtime.
- [ ] Strong unique secrets.
- [ ] Database not publicly exposed.
- [ ] Automated backups configured.
- [ ] Restore test completed.
- [ ] Media storage backup policy.
- [ ] Log retention and access control.
- [ ] Dependency and OS updates.
- [ ] AI provider cost limits and alerts.
- [ ] Manual approval and no-auto-publish guard verified.
