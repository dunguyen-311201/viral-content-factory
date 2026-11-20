# Test Strategy

## Test pyramid
- Unit: scoring, eligibility, state transitions, validation, prompt output parsing.
- Integration: PostgreSQL repositories, transactions, BullMQ job persistence, storage adapters.
- E2E: source intake → trend → brief → content → review → approval → media export → publication record.
- Manual editorial tests: privacy, copyright, factuality, tone, Vietnamese naturalness.

## Critical invariants to test
1. Restricted/rejected source cannot be used for generation.
2. AI output cannot approve content.
3. Content version approval is immutable and version-specific.
4. Unapproved content cannot enter media production.
5. Unconfirmed media cannot be marked ready to publish.
6. Publication requires approved content version.
7. Retry of a generation/render job does not create duplicate business records.
8. Source text cannot override system instructions.
9. High/critical risk findings block approval.
10. Metrics are append-only snapshots.

## Quality gates
- `lint`
- `typecheck`
- `test`
- `test:integration`
- `test:e2e` for critical workflow
- Prisma migration validation
- Dependency audit appropriate to project stage

## Definition of done
A feature is not done because the UI renders. It is done when business rules, failure paths, tests, docs, and audit behavior are covered.
