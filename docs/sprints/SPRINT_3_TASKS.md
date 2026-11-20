# Sprint 3 — Editorial Brief and Content Generation

## Objective
Generate structured briefs and original Vietnamese content with immutable revisions.

## Read first
- Constitution and AGENTS
- PRD FR-04/FR-05
- User stories US-07/US-08/US-09
- ERD briefs/contents/content_versions
- AI_SYSTEM and CONTENT_PLAYBOOK

## Tasks
1. Implement editorial_briefs model/API/UI.
2. Implement prompt registry with versioned files.
3. Implement LLM adapter and mock provider.
4. Build structured schemas for brief and content package.
5. Implement generation jobs with idempotency and retry handling.
6. Persist ai_runs and cost/latency metadata.
7. Implement content item and immutable content version creation.
8. Build content editor with revision history.
9. Add prompt-injection and schema-validation tests.

## Acceptance criteria
- Brief includes facts, claims, unknowns, safe angle, and source mapping.
- Script output contains 3+ angles and 3+ hooks.
- Vietnamese script targets 45–90 seconds unless configured otherwise.
- Each substantive edit creates a new version.
- Source text is treated as untrusted data.
- No verbatim copying by design; similarity warning is surfaced where implemented.
