# Product Requirements Document (PRD)

## 1. Product overview
**Product name:** Viral Content Factory (VCF)  
**Version:** 1.0  
**Primary user:** one Vietnamese content operator / channel owner  
**Problem:** Topic discovery, research, scripting, review, and short-video production are fragmented and time-consuming. Trend signals can be noisy, duplicated, unverified, or legally risky.  
**Solution:** A human-in-the-loop workflow that turns permitted source signals into original, quality-checked, production-ready content.

## 2. Goals and non-goals
### Goals
- Reduce time from topic discovery to approved script.
- Make source provenance and editorial risk visible.
- Generate consistent content packages in Vietnamese.
- Produce repeatable faceless videos at low operating cost.
- Learn which topics, hooks, formats, and lengths work for the channel.

### Non-goals
- Guarantee virality or income.
- Copy viral Threads posts.
- Replace human editorial judgment.
- Automatically publish in MVP.
- Become a social listening enterprise platform.

## 3. Target audience and brand hypothesis
Initial brand hypothesis: **“Góc Khuất – Những câu chuyện khiến bạn nhìn cuộc sống theo một cách khác.”**

Editorial territory:
- Relationships and communication.
- Workplace dynamics and boundaries.
- Social psychology and everyday behavior.
- Public-interest social conversations.

Initial content mix for experimentation:
- 35% relationships.
- 25% workplace.
- 25% social psychology.
- 15% broader social discussion.

These percentages are hypotheses, not permanent rules. Review after 30–50 published pieces.

## 4. Core workflow
1. Operator submits a source URL, short note, or manually entered observation.
2. System stores provenance and permission/verification metadata.
3. System normalizes, hashes, and deduplicates the source.
4. Trend Scout classifies and clusters related signals.
5. Trend Analyst scores relevance, novelty, discussion potential, freshness, and risk.
6. Operator selects a trend and generates an editorial brief.
7. Writer generates multiple angles, hooks, script, caption, CTA, and scene plan.
8. Quality Reviewer checks evidence, clarity, privacy, copyright, defamation, and brand fit.
9. Operator edits, approves, or rejects.
10. Media Producer creates a draft video using approved templates.
11. Operator previews and exports assets.
12. Operator publishes manually and records the publication.
13. Performance metrics are recorded and used to improve future recommendations.

## 5. Functional requirements
### FR-01 Source intake
- Accept URL, title, source platform, source type, notes, discovered timestamp, and source owner/attribution if known.
- Accept manually entered notes without a URL.
- Require source permission status and verification status.
- Support statuses: `unknown`, `permitted`, `permission_required`, `restricted`, `rejected`.
- Support verification: `unverified`, `partially_verified`, `verified`, `disputed`, `not_applicable`.
- Store normalized URL and SHA-256 content fingerprint where content is lawfully available.
- Do not scrape source pages in MVP.

### FR-02 Source management
- List, search, filter, edit, archive, and mark a source as unusable.
- Preserve provenance on any generated trend/content.
- Prevent restricted/rejected sources from being used in content generation unless explicitly overridden by an approved policy flow (MVP: no override).

### FR-03 Trend clustering and scoring
- Group related source records into a trend.
- Store topic, summary, category, tags, freshness, source count, score breakdown, risk level, and expiry.
- Score components: relevance, freshness, novelty, discussion potential, evidence quality, and risk penalty.
- Scores must be explainable; do not show a single opaque “viral probability”.

### FR-04 Editorial brief
- Generate audience, core tension, context, verified facts, unknowns, safe angle, recommended format, and source list.
- Explicitly distinguish facts, claims, opinions, and open questions.
- Require at least one source or operator-provided context note.

### FR-05 Content generation
- Generate 3–5 angles and 3 hook variants.
- Generate a Vietnamese script targeted at 45–90 seconds.
- Include scene-by-scene narration/visual guidance, caption, CTA, title, and optional pinned comment.
- Avoid verbatim copying from sources.
- Allow operator edits and version history.

### FR-06 Quality and risk review
- Check source coverage, unsupported claims, privacy, defamation, harassment, hate, copyright similarity, sensationalism, and brand fit.
- Return findings with severity, evidence location, explanation, and suggested fix.
- Block approval when critical findings remain.
- AI review is advisory; human approval is mandatory.

### FR-07 Human review
- Status transitions: draft → in_review → changes_requested / approved / rejected.
- Record reviewer, timestamp, decision, notes, and checklist.
- Require explicit human approval before media production.
- Require final human confirmation before export as publish-ready.

### FR-08 Media production
- Generate a scene plan from approved script.
- Support template-based video with background visuals, text cards, voice-over, subtitles, and optional music from licensed/owned assets.
- TTS provider is replaceable.
- Render using FFmpeg.
- Store output metadata and file path; do not store huge binaries in PostgreSQL.
- Provide preview and export.

### FR-09 Publication tracking
- MVP supports manual publication entry only.
- Record platform, channel, post URL/ID, published timestamp, content version, and operator.
- No social account credentials or auto-posting in MVP.

### FR-10 Analytics
- Record views, reach (if available), average watch time, completion/retention, likes, comments, shares, saves, follows, and collection timestamp.
- Metrics are platform-specific and may be unavailable.
- Display simple per-content comparisons and trend summaries.
- Avoid treating raw views as the sole success metric.

### FR-11 Cost tracking
- Record model, input/output tokens where available, latency, estimated cost, TTS characters/minutes, render duration, and provider.
- Provide monthly estimate and budget warning at 80% and 100% of configured limit.

## 6. Non-functional requirements
- Single-operator deployment; secure authentication.
- API response target under 500 ms for ordinary CRUD requests, excluding AI and rendering jobs.
- AI and media work run asynchronously.
- Queue jobs are idempotent and retry-safe.
- Basic backup and restore documented.
- Audit trail for approvals and source status changes.
- Local development via Docker Compose.
- Responsive desktop-first UI.
- App timezone display: `Asia/Ho_Chi_Minh`; storage in UTC.
- No raw personal/private data by default.

## 7. MVP success metrics
Operational:
- At least 80% of generated scripts pass review with minor edits after prompt tuning (target, not guarantee).
- Median source-to-approved-script time decreases over baseline.
- 100% of published content has an approval record and source provenance or is marked original/editorial.
- AI/media costs stay within the configured monthly budget.

Content:
- Track 3-second hold, average watch time, completion rate, shares/saves per view, follows per 1,000 views.
- Compare by topic, hook, duration, and format.
- Do not define success as one viral post.

## 8. User experience principles
- One clear next action per content item.
- Show source provenance and risk near the content, not hidden in a separate admin page.
- Explain scores and review findings.
- Make editing faster than regenerating.
- Keep a visible “not approved for publishing” state until approval.

## 9. Release plan
- MVP: source intake → trends → brief/script → review → media export → manual publication/analytics.
- V1.1: improved analytics, content calendar, reusable brand kits, batch generation.
- Later: permitted platform integrations, collaboration, multi-channel support, monetization tracking.
