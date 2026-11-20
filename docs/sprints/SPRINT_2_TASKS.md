# Sprint 2 — Trends and Explainable Scoring

## Objective
Create trends manually from eligible sources and provide transparent AI-assisted analysis.

## Read first
- `PROJECT_CONSTITUTION.md`
- `AGENTS.md`
- PRD FR-03
- User stories US-04/US-05/US-06
- HLD and ERD trend sections
- AI_SYSTEM scoring model

## Tasks
1. Implement trends and trend_sources persistence.
2. Implement create/update/list/detail and link/unlink source endpoints.
3. Enforce source eligibility before linking.
4. Implement deterministic scoring calculator and score breakdown.
5. Add Trend Scout/Analyst provider interfaces with mock implementation.
6. Validate structured model output.
7. Persist analysis rationale, confidence, expiry, and AI run metadata.
8. Build trend list/detail UI.
9. Add tests for scoring, eligibility, malformed output, and expiry.

## Acceptance criteria
- Operator can create a trend and link multiple eligible sources.
- AI suggestions do not silently merge trends.
- Score components and risk penalty are visible.
- Low evidence quality lowers confidence/score.
- No “viral probability” claims.
