# Sprint Plan — 8 Weeks

Each sprint is assumed to be about one week. Adjust scope to actual capacity; quality gates are not optional.

## Sprint 0 — Foundation and product skeleton
Deliverables:
- Repository scaffold and workspace scripts.
- Docker Compose for PostgreSQL and Redis.
- Next.js, NestJS, worker bootstrap.
- Health checks, config validation, structured logging.
- CI for lint, typecheck, tests.
Exit criteria:
- Clean clone can start locally using documented steps.
- No real credentials required; mock providers work.

## Sprint 1 — Source intake and provenance
Deliverables:
- Source schema and migrations.
- Create/list/detail/update/archive source APIs.
- Source intake UI.
- URL normalization and duplicate detection.
- Permission/verification status and eligibility guard.
Exit criteria:
- US-01, US-02 pass.
- Restricted/rejected source cannot be selected downstream.

## Sprint 2 — Trends and scoring
Deliverables:
- Trend and trend-source schema.
- Manual trend creation and source linking.
- Trend Scout/Analyst interfaces and mock provider.
- Explainable score breakdown and expiry.
Exit criteria:
- US-04, US-05 pass.
- No opaque viral-probability language.

## Sprint 3 — Brief and content generation
Deliverables:
- Editorial brief schema/API/UI.
- Prompt registry and LLM adapter.
- Structured output validation.
- Content versions and editor.
Exit criteria:
- US-07, US-08, US-09 pass using mock and one real provider behind configuration.
- Prompt injection test passes.

## Sprint 4 — Quality review and human approval
Deliverables:
- Review report and decision schema.
- AI reviewer with structured findings.
- Approval state machine and audit.
- UI for review and revision.
Exit criteria:
- US-10, US-11 pass.
- AI cannot approve.
- Critical/high findings block according to policy.

## Sprint 5 — Media production
Deliverables:
- Scene plan validation.
- TTS adapter and mock provider.
- Subtitle generation.
- FFmpeg template renderer.
- Media preview and export.
Exit criteria:
- US-12, US-13 pass.
- Only approved versions can render.
- Render retry is idempotent.

## Sprint 6 — Manual publishing and analytics
Deliverables:
- Publication record UI/API.
- Manual metric snapshots.
- Basic dashboard and comparisons.
- Cost tracking view.
Exit criteria:
- US-15, US-16, US-18 pass.
- No auto-publishing or social credentials.

## Sprint 7 — Hardening and pilot
Deliverables:
- End-to-end regression.
- Backup/restore guide and test.
- UX fixes, error states, performance baseline.
- 10–15 pilot content pieces if editorially approved.
- Operational runbook.
Exit criteria:
- Critical workflow passes.
- Owner can operate without developer intervention for routine tasks.
- Risks and known gaps documented.

## Sprint 8 — Content validation and iteration
Deliverables:
- Aim for 30 total published pieces if quality and capacity permit.
- Analyze hook/topic/duration/format results.
- Tune prompts and playbook with versioned changes.
- Prioritize V1.1 backlog based on evidence.
Exit criteria:
- Written pilot report with metrics, lessons, and next decisions.
