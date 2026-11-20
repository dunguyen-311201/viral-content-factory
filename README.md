# Viral Content Factory — Project Documentation v1.0

> AI-assisted content research and production system for owned Vietnamese social channels.
> Status: Baseline v1.0 | Date: 2026-11-20 | Owner: Project Owner

## What this project does
Viral Content Factory turns topic signals and permitted source material into original, reviewed, faceless social content. It supports a human-approved workflow from source intake to trend analysis, brief, script, quality review, media production, publishing record, and performance learning.

## Product boundaries
- Initial market: Vietnam; Vietnamese-language content.
- Initial niche: relationships, workplace stories, social psychology, and public-interest social discussion.
- Initial channels: TikTok and Facebook Reels; YouTube Shorts is a later distribution target.
- Business model: owned channels first; affiliate/sponsorship/digital products only after audience validation.
- Automation: balanced. AI performs research assistance and drafting; a human approves sensitive content and publishing.
- Monthly operating budget target: under VND 3,000,000 during validation. This is a planning constraint, not a guarantee.
- MVP is an internal tool for one owner/operator, not a multi-tenant SaaS.

## Read order for Claude Code
1. `PROJECT_CONSTITUTION.md`
2. `AGENTS.md`
3. `docs/business/PRD.md`
4. `docs/product/USER_STORIES.md`
5. `docs/architecture/HLD.md`
6. `docs/architecture/ERD.md`
7. `docs/architecture/ADR.md`
8. `docs/ai/AI_SYSTEM.md`
9. `docs/operations/SECURITY_AND_COMPLIANCE.md`
10. The active sprint file under `docs/sprints/`

Do not load every file for every task. Load the constitution, agent rules, relevant domain docs, and current sprint only.

## Repository status
This bundle defines the intended baseline. It is not an implementation. Claude Code should implement incrementally and keep code, tests, and docs synchronized.

## Definition of project success
Within the first 8 weeks:
- Complete a usable single-operator MVP.
- Process manually submitted source URLs and permitted source records.
- Generate structured trend briefs and original scripts.
- Enforce human review and approval before publication.
- Produce repeatable short-video assets using templates, TTS, subtitles, and FFmpeg.
- Record publishing metadata and basic performance metrics.
- Test at least 30 published content pieces if quality and operational capacity allow; optimize based on actual performance, not vanity metrics.
