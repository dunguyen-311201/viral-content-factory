# Sprint 1 — Source Intake and Provenance

## Objective
Deliver reliable manual source capture with provenance and eligibility controls.

## Read first
- `PROJECT_CONSTITUTION.md`
- `AGENTS.md`
- `docs/business/PRD.md` FR-01/FR-02
- `docs/product/USER_STORIES.md` US-01/US-03
- `docs/architecture/ERD.md` sources
- `docs/operations/SECURITY_AND_COMPLIANCE.md`
- This file

## Tasks
1. Implement source enums/types and Prisma model.
2. Add migration and seed safe demo records.
3. Implement URL normalization and duplicate detection.
4. Implement source create/list/detail/update/archive endpoints.
5. Add DTO validation and pagination/filtering.
6. Implement eligibility service.
7. Add source intake and detail UI.
8. Add audit events for status changes.
9. Add unit/integration/E2E tests.

## Acceptance criteria
- URL or operator note is required.
- Normalized duplicate URL returns/link existing source without creating duplicate.
- Permission and verification statuses are required/defaulted safely.
- `restricted` and `rejected` sources are ineligible.
- No external page fetch or scraping occurs.
- Audit event records source eligibility status changes.
- Tests cover invalid URL, duplicate URL, note-only source, and ineligible source.

## Out of scope
- Threads API integration.
- Browser automation.
- Automatic content extraction.
