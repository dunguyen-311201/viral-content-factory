# User Stories and Acceptance Criteria

Priority: P0 = required for MVP, P1 = valuable, P2 = later.

## Epic A — Source intake and provenance
### US-01 [P0] Add a source manually
As an operator, I want to submit a URL or observation so I can capture a topic signal.
Acceptance:
- Form accepts URL or note; at least one is required.
- Source platform/type, permission status, and verification status are captured.
- Invalid URLs are rejected with a clear message.
- Duplicate normalized URLs are detected and linked to the existing record.
- Source is not fetched or scraped automatically.

### US-02 [P0] Review source safety metadata
As an operator, I want to see permission and verification status before using a source.
Acceptance:
- Source detail displays URL, origin, date, permission, verification, notes, and usage eligibility.
- `restricted` and `rejected` sources cannot be selected for generation.
- Status changes are audited.

### US-03 [P1] Search and filter sources
Acceptance:
- Search by title, URL, note, tag.
- Filter by platform, permission, verification, date, and archive state.

## Epic B — Trends
### US-04 [P0] Cluster source records into a trend
Acceptance:
- Operator can create a trend manually from one or more sources.
- AI-assisted clustering may suggest related records but cannot silently merge records.
- Trend displays linked sources and provenance.

### US-05 [P0] Generate an explainable trend score
Acceptance:
- Score breakdown is persisted.
- Risk penalty is visible.
- Missing evidence reduces confidence.
- No “guaranteed viral” language appears.

### US-06 [P1] See trend expiry
Acceptance:
- Trend has `expires_at` and status `active`, `cooling`, `expired`, or `archived`.
- Expired trends are excluded from default recommendations.

## Epic C — Brief and content generation
### US-07 [P0] Generate an editorial brief
Acceptance:
- Brief contains audience, tension, context, facts, claims, unknowns, safe angle, format, and source references.
- Output conforms to a validated schema.
- Source IDs are retained.

### US-08 [P0] Generate original content angles and scripts
Acceptance:
- At least 3 angles and 3 hooks are returned.
- Script has estimated duration and scene breakdown.
- Script is in Vietnamese unless explicitly configured otherwise.
- Similarity/copying warnings are surfaced.
- Output is stored as a new version; previous versions remain available.

### US-09 [P0] Edit a content version
Acceptance:
- Operator can edit title, hook, script, caption, CTA, and scenes.
- Save creates a version record or immutable revision.
- Updated version has `edited_by_human=true`.

## Epic D — Review and approval
### US-10 [P0] Run quality review
Acceptance:
- Review returns findings with severity, category, evidence span, explanation, and suggested fix.
- Critical findings block approval.
- AI output is labelled advisory.

### US-11 [P0] Approve or reject content
Acceptance:
- Approval requires authenticated human user.
- Decision, reviewer, timestamp, and notes are stored.
- No media production or publish-ready export before approval.
- Rejected content cannot proceed without a new revision and review.

### US-12 [P0] Confirm final media
Acceptance:
- Operator previews rendered asset.
- Operator confirms it is ready to publish.
- Export metadata records approved content version.

## Epic E — Media
### US-13 [P0] Generate a template video
Acceptance:
- Uses approved script only.
- Creates voice-over, subtitles, scenes/text cards, and MP4.
- Render errors are visible and retryable.
- Render job is idempotent for the same content version and settings.

### US-14 [P1] Manage brand templates
Acceptance:
- Operator can select template, font, logo, colors, intro/outro, and subtitle style.
- Assets must be owned or licensed.

## Epic F — Publishing and analytics
### US-15 [P0] Record manual publication
Acceptance:
- Platform, channel, URL/ID, content version, and published time are stored.
- Only approved final media can be associated.
- No API credentials are required.

### US-16 [P0] Enter performance metrics
Acceptance:
- Metrics include collection time and source platform.
- Missing metrics are allowed.
- Metric snapshots are append-only.

### US-17 [P1] Compare content performance
Acceptance:
- Filter by date, platform, topic, format.
- Show retention/watch-time and shares/saves where available.
- Explain small sample sizes.

## Epic G — Cost and operations
### US-18 [P0] Inspect AI run cost
Acceptance:
- AI runs show provider/model, prompt version, duration, token usage, and estimated cost.
- Unknown cost is represented as unknown, not zero.

### US-19 [P1] Budget alerts
Acceptance:
- Configurable monthly limit.
- Warning at 80%; critical at 100%.
- Budget alert does not silently disable critical safety review.

## Global acceptance criteria
- Authentication required for all operator functions.
- Audit events for source status, approval, publication, and destructive actions.
- All API inputs validated.
- Critical flows have automated tests.
- No automatic publishing in MVP.
