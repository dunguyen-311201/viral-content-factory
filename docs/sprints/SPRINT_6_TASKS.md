# Sprint 6 — Manual Publishing, Analytics, and Cost Tracking

## Objective
Close the feedback loop without connecting social accounts or auto-publishing.

## Read first
- Constitution and AGENTS
- PRD FR-09/FR-10/FR-11
- User stories US-15/US-16/US-18
- ERD publication and metrics

## Tasks
1. Implement publication record APIs/UI.
2. Enforce approved content version and final media confirmation.
3. Implement append-only metric snapshots.
4. Build simple content performance dashboard.
5. Persist AI/TTS/render cost metadata.
6. Add monthly budget warning thresholds.
7. Add tests for publication gate, metric snapshots, and unknown costs.

## Acceptance criteria
- Publication is manually recorded by operator.
- No social credentials or auto-posting functionality exists.
- Metrics can be partially entered and are timestamped.
- AI usage and estimated cost are inspectable.
- Unknown provider costs are not shown as zero.
