# Architecture Decision Records

## ADR-001 — Modular monolith for MVP
**Status:** Accepted  
**Decision:** Build one NestJS backend with clear modules and a separate worker process sharing the same codebase.  
**Context:** One operator, uncertain product-market fit, low budget.  
**Consequences:** Lower operational overhead; module boundaries must be respected to avoid a monolith becoming tangled. Revisit only with measured scaling or team needs.

## ADR-002 — PostgreSQL as source of truth
**Status:** Accepted  
**Decision:** Store durable business state in PostgreSQL. Redis is only for queues/cache.  
**Consequences:** Easier consistency and backups. Queue state must be reconciled with database job records.

## ADR-003 — BullMQ for asynchronous processing
**Status:** Accepted  
**Decision:** Use Redis + BullMQ for AI and media jobs.  
**Consequences:** Retry and idempotency required; dead-letter/terminal failure states must be visible.

## ADR-004 — Manual source intake in MVP
**Status:** Accepted  
**Decision:** No automated Threads scraping or collection in MVP. Sources are manually submitted or entered through approved/official access methods.  
**Context:** Platform terms, copyright, privacy, and anti-bot controls can constrain collection.  
**Consequences:** Less automation initially, substantially lower compliance and maintenance risk.

## ADR-005 — Human approval before publishing
**Status:** Accepted  
**Decision:** AI cannot publish. A human must approve the content version and final media. Publishing is manual in MVP.  
**Consequences:** Slower throughput but editorial accountability and reduced risk.

## ADR-006 — Immutable content versions
**Status:** Accepted  
**Decision:** Each substantive edit creates a new content version. Review and approval attach to a specific version.  
**Consequences:** Reliable audit history; UI must make current version explicit.

## ADR-007 — Provider adapters for LLM and TTS
**Status:** Accepted  
**Decision:** Wrap LLM and TTS providers behind interfaces.  
**Consequences:** Easier provider changes and cost control; avoid overengineering a generic plugin framework.

## ADR-008 — FFmpeg template-based video generation
**Status:** Accepted  
**Decision:** Generate faceless videos from scene templates, licensed/owned visuals, TTS, subtitles, and FFmpeg.  
**Consequences:** Predictable cost and repeatability; visual variety is limited until templates improve.

## ADR-009 — Local-first media storage
**Status:** Accepted  
**Decision:** Use local filesystem for development and an adapter boundary for future object storage.  
**Consequences:** Simple MVP; production deployment must implement backup and storage durability.

## ADR-010 — Single-operator authentication
**Status:** Proposed for implementation  
**Decision:** Use a secure single-operator authentication approach; do not build team/RBAC complexity in MVP.  
**Open choice:** Decide between managed auth and local credentials before Sprint 1 implementation. Password-based auth requires secure hashing, session handling, rate limits, and recovery strategy.

## ADR-011 — npm workspaces monorepo and pinned framework majors
**Status:** Accepted (Sprint 0)  
**Decision:** Use plain npm workspaces (`apps/*`, `packages/*`) with no Nx/Turborepo. Node 22 LTS. Framework majors pinned to Next.js 15, NestJS 11, Prisma 6, BullMQ 5, TypeScript 5.9, zod 4, Jest 29, ESLint 9. Shared code lives in `packages/shared` (env, logging, correlation, health, queue names) and `packages/ai` (provider interfaces and mocks), compiled to CommonJS by `tsc`.  
**Context:** One operator and a small codebase. npm ships with Node, so there is no extra tool to install on Windows. Newer majors (Next 16, Prisma 7, TypeScript 7) exist but carry migration risk for no Sprint 0 benefit.  
**Consequences:** `npm install` runs `prisma generate` and builds `packages/*` in `postinstall`. Upgrading a framework major is a deliberate, separately tested change. `package.json#overrides` patches transitive advisories (postcss, effect, deepmerge-ts); remove each override once the parent package ships the fix.

## ADR-012 — Validated configuration, structured logs and correlation IDs
**Status:** Accepted (Sprint 0)  
**Decision:** Every process validates its environment with zod at startup and exits with a list of actionable errors. `LLM_PROVIDER`/`TTS_PROVIDER` accept only `mock` until the Project Owner approves a provider. Logs are JSON (pino) with secret redaction. An `x-correlation-id` is accepted (when safe) or generated per request, returned in the response, stored in AsyncLocalStorage, placed in job payloads and restored by the worker, so one ID traces a request across API and worker.  
**Consequences:** Adding a provider requires changing the env schema, which keeps the approval gate visible in code review.
