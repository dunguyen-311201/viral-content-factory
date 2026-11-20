# Sprint 0 — Claude Code Execution Brief

## Objective
Create a runnable local monorepo foundation without implementing product features prematurely.

## Read first
- `PROJECT_CONSTITUTION.md`
- `AGENTS.md`
- `docs/architecture/HLD.md`
- `docs/operations/DEPLOYMENT_AND_ENV.md`
- `docs/operations/TEST_STRATEGY.md`
- This file

## Tasks
1. Inspect the repository and report whether it is empty or has existing code.
2. Propose workspace tooling and package manager. Prefer a simple workspace setup; do not introduce Nx/Turborepo unless justified.
3. Scaffold `apps/web`, `apps/api`, `apps/worker`, and shared packages only if needed.
4. Add Docker Compose for PostgreSQL and Redis.
5. Add validated environment configuration and `.env.example`.
6. Add health endpoints for API and worker readiness.
7. Add structured logging and correlation ID propagation.
8. Add lint, typecheck, unit-test scripts and CI workflow.
9. Add README local setup and troubleshooting.
10. Verify clean local startup with mock providers.

## Constraints
- No paid provider integration in this sprint.
- No scraping, social login, or publishing integration.
- No microservices.
- No unnecessary UI feature work.
- Keep dependencies minimal.

## Acceptance criteria
- `docker compose up -d` starts PostgreSQL and Redis.
- Web, API, and worker start locally.
- API health endpoint reports dependency status.
- Environment validation fails fast with actionable errors.
- CI runs lint/typecheck/tests.
- All tests pass.
- `.env` is ignored by git; `.env.example` contains placeholders only.

## Claude Code final report
Include:
- Architecture and package-manager choice.
- File tree.
- Commands run and outcomes.
- How to start locally.
- Known limitations.
- Recommended Sprint 1 tasks.
