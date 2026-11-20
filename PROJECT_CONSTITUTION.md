# Project Constitution

## 1. Mission
Build a lean AI-assisted editorial and production workspace that helps one operator discover audience-relevant topics, transform them into original Vietnamese content, and learn from performance while protecting accuracy, privacy, copyright, and platform integrity.

## 2. Non-negotiable principles
1. **Originality over copying.** Sources are signals and evidence, not material to republish verbatim.
2. **Human accountability.** AI drafts and recommends; a human owns editorial decisions and publication.
3. **Provenance by default.** Every source-derived claim must be traceable to a source record and verification status.
4. **Safety before virality.** Do not optimize engagement at the expense of privacy, dignity, accuracy, or safety.
5. **Smallest useful system.** Start with a modular monolith and a single-operator workflow. Do not introduce microservices without demonstrated need.
6. **Cost awareness.** Track model usage and media costs. Use inexpensive models for routine classification and stronger models only where quality requires them.
7. **Reversible decisions.** Prefer replaceable providers, versioned prompts, migrations, and explicit configuration.
8. **No silent publishing.** Nothing may be published automatically in MVP.

## 3. Product scope
### In scope for MVP
- Manual source URL and note intake.
- Source provenance, source type, permission status, verification status, and content hash.
- Deduplication and topic clustering.
- Trend scoring and editorial brief generation.
- Original hook, script, caption, CTA, and scene plan generation.
- Automated quality/risk checks with evidence and explanations.
- Human review, revision, approval, and rejection.
- Template-based media generation with TTS, subtitles, and FFmpeg.
- Export/download of ready-to-publish assets.
- Manual publication record and basic analytics entry/import.
- Cost and AI-run observability.

### Out of scope for MVP
- Scraping Threads or other platforms in ways that violate terms, technical controls, or applicable law.
- Automatic posting or account login automation.
- Multi-tenant SaaS, subscriptions, billing, and team permissions.
- Fully generative cinematic video.
- Automated fact-checking represented as certainty.
- Automatic use of personal/private posts, private groups, leaked content, or doxxing.
- Automated replies, engagement farming, fake accounts, or artificial interactions.
- Native mobile application.

## 4. Editorial safety rules
- Never present an allegation about an identifiable person as established fact without reliable, independently checked evidence and editorial approval.
- Do not reveal or infer private identities, addresses, workplaces, contact details, or other identifying information about private individuals.
- Do not reproduce private messages, screenshots, or personal photos without clear permission and a legitimate basis.
- For real-person disputes, prefer anonymized, generalized, or fictionalized composites only when clearly labeled as such; do not imply a composite is a verified real event.
- Separate fact, allegation, opinion, interpretation, and fictionalization.
- Do not generate defamatory, hateful, harassing, sexually exploitative, or inciting content.
- Add a correction or takedown path for published errors.
- When a source cannot be verified, either exclude the claim or clearly frame it as an unverified discussion topic without repeating harmful allegations.

## 5. Engineering standards
- TypeScript strict mode.
- Validate all external input at boundaries.
- Keep business logic independent of provider SDKs.
- Use database migrations; never rely on ad-hoc production schema changes.
- Unit-test domain logic; integration-test persistence and queues; E2E-test critical workflows.
- Store prompt/model/version/cost metadata for every AI run.
- Never commit secrets, credentials, access tokens, or personal source data.
- Log identifiers and state transitions, not unnecessary personal content.
- Every sprint ends with tests, docs updates, and a concise implementation report.

## 6. Decision authority
The Project Owner decides product priorities, editorial policy, spend limits, and publication. Claude Code may propose changes but must not expand scope or change policy without approval.

## 7. Change control
Any change to scope, data retention, source collection method, publication automation, risk policy, or external provider requires:
1. A short proposal with reason and impact.
2. Security/privacy/copyright review where relevant.
3. ADR if architecture or a durable technical decision changes.
4. Project Owner approval before implementation.
