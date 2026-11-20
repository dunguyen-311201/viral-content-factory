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
```

Never commit real values. `.env.example` must contain placeholders only.

## Local setup checklist
- Install supported Node.js LTS and package manager.
- Copy `.env.example` to `.env`.
- Start PostgreSQL and Redis with Docker Compose.
- Install dependencies.
- Run Prisma migrations.
- Seed a local operator and safe demo data.
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
