# Security, Privacy, Copyright, and Platform Compliance

This document is an engineering/editorial control baseline, not legal advice. The Project Owner must check current platform terms and applicable Vietnamese law before launching or changing collection methods.

## 1. Source collection
- MVP source intake is manual.
- Use official APIs or approved access only where permitted by the platform and applicable rules.
- Do not bypass login walls, rate limits, anti-bot controls, access controls, or technical restrictions.
- Public visibility does not automatically grant permission to copy, republish, or commercially exploit content.
- Record source URL, date accessed, attribution, permission status, and verification status.
- Do not store complete source text or media unless a valid permission/retention basis is documented.

## 2. Copyright
- Use sources to identify topics and research leads.
- Create original scripts and visual expression.
- Do not copy distinctive wording, screenshots, images, videos, or comments without permission or another valid legal basis.
- Use owned, public-domain, or properly licensed media, fonts, music, and voice assets.
- Keep license/proof metadata for assets.
- Similarity detection is a warning aid, not a legal determination.

## 3. Privacy and personal data
- Avoid identifying private individuals.
- Do not ingest private groups, leaked content, intimate images, personal contact information, or private messages.
- Minimize collection and retention.
- Provide a process to remove or correct source-derived material.
- Restrict access to source records and media.
- Do not send unnecessary personal data to LLM providers.

## 4. Defamation and harmful content
- Treat accusations as allegations unless independently substantiated.
- Require human fact-checking for real-person claims.
- Block content that exposes private identities or invites harassment.
- Do not publish unverified criminal, sexual, health, or misconduct allegations about identifiable private people.
- Escalate high/critical risk to the Project Owner; MVP should reject/block rather than automate a legal judgment.

## 5. Security controls
- Authentication required.
- Secrets in environment variables; `.env` ignored by git.
- Use HTTPS in production.
- Apply least privilege to database and storage.
- Validate uploads, MIME types, file sizes, and paths.
- Rate-limit generation endpoints.
- Keep audit records for approvals and destructive actions.
- Back up database and media; test restore.
- Avoid logging raw prompts containing personal data or full source text.

## 6. Data retention baseline
- Source metadata: retain while useful; review archived records periodically.
- Raw excerpts: avoid by default; if added, define a short retention period and permission basis.
- Generated content and audit trail: retain for editorial history unless removal is required.
- Media artifacts: retain only versions needed for operations and analytics.
- Deletion requests: mark affected records, remove derived content/assets where appropriate, and preserve only legally necessary audit evidence.

## 7. Incident response
1. Pause affected content or workflow.
2. Preserve minimal evidence and audit IDs.
3. Identify affected sources, content versions, media, and publications.
4. Remove/unpublish or correct where appropriate.
5. Rotate compromised credentials if applicable.
6. Document cause, impact, remediation, and prevention.
7. Resume only after Project Owner approval.
