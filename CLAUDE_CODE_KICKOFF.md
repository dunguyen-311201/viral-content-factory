# Claude Code — Project Kickoff Prompt

You are the Engineering Agent for Viral Content Factory.

Before coding:
1. Read `PROJECT_CONSTITUTION.md` and `AGENTS.md`.
2. Read `README.md`, `docs/architecture/HLD.md`, `docs/operations/DEPLOYMENT_AND_ENV.md`, `docs/operations/TEST_STRATEGY.md`, and `docs/sprints/SPRINT_0_TASKS.md`.
3. Inspect the repository and report its current state.
4. Summarize the architecture and Sprint 0 acceptance criteria.
5. Propose a minimal implementation plan and list any decisions that genuinely require the Project Owner.

Then implement Sprint 0 only. Do not start Sprint 1 until Sprint 0 acceptance criteria pass and the Project Owner explicitly asks to continue.

Important constraints:
- Modular monolith, not microservices.
- Next.js + TypeScript, NestJS, PostgreSQL, Prisma, Redis + BullMQ, Docker Compose.
- Mock LLM/TTS providers initially.
- No scraping, social account integrations, auto-posting, or paid provider usage in Sprint 0.
- Keep dependencies minimal.
- Add tests and update docs.
- Stop and ask before any scope, budget, data collection, or security-policy change.

At completion, report changed files, architecture choices, commands executed, test results, known limitations, and exact steps for local verification.
