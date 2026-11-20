# Sprint 5 — Template Media Production

## Objective
Render approved scripts into previewable faceless video assets.

## Read first
- Constitution and AGENTS
- PRD FR-08
- User stories US-12/US-13
- HLD async jobs and media
- SECURITY_AND_COMPLIANCE asset licensing

## Tasks
1. Implement media asset/job persistence.
2. Implement scene manifest validation.
3. Implement TTS adapter and mock TTS.
4. Generate SRT/VTT subtitles.
5. Implement FFmpeg template rendering.
6. Use only owned/licensed visuals, fonts, and music.
7. Add preview and export UI.
8. Implement retries, timeout, cleanup, and idempotency.
9. Add tests for approval gate and failed render handling.

## Acceptance criteria
- Only approved content versions can render.
- Output MP4 and subtitle asset are stored with checksums and metadata.
- Render can be retried safely.
- Operator can preview and explicitly confirm final media.
- No unlicensed third-party source media is used.
