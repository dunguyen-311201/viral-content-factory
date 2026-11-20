# Sprint 4 — Quality Review and Human Approval

## Objective
Create a hard approval gate between AI drafting and media production.

## Read first
- Constitution and AGENTS
- PRD FR-06/FR-07
- User stories US-10/US-11
- AI_SYSTEM review schema
- SECURITY_AND_COMPLIANCE

## Tasks
1. Implement review_reports and review_decisions.
2. Implement Quality Reviewer with mock and configured LLM provider.
3. Validate finding schema and severity.
4. Implement content state transition service.
5. Block approval when critical findings exist; require human action for high-risk cases.
6. Add explicit human approval UI and checklist.
7. Add audit events for review decisions.
8. Add tests proving AI cannot approve and unapproved content cannot render.

## Acceptance criteria
- Findings include category, severity, location, issue, rationale, suggested fix.
- AI review recommendation is advisory only.
- Human approval is tied to immutable content version.
- A new edit invalidates approval for the previous version only; it does not inherit approval.
- Critical risk blocks progression.
