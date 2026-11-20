# Open Questions for Project Owner

These are deliberately left open where the prior brief did not establish a final choice. Claude Code should not invent answers.

1. Authentication: managed auth provider or local single-operator credentials? **Needed before Sprint 1** (ADR-010). Sprint 0 ships no auth; only health and the dev-only diagnostics endpoint exist.
2. LLM provider/model: which provider and monthly hard limit?
3. TTS provider/voice: which Vietnamese voice, and is commercial use permitted under its terms?
4. Brand identity: final name, logo, font, colors, and voice style?
5. Video template: 9:16 only for MVP, or also 1:1/16:9?
6. Media storage: local disk for pilot or object storage from first deployment?
7. Hosting: local-only until pilot, or deploy to a low-cost VPS after Sprint 5?
8. Source access: manual links/notes only at first, or an official API integration after terms review?
9. Channel naming and account ownership for TikTok/Facebook?
10. What evidence threshold should trigger exclusion for real-person claims? Default: exclude or anonymize unless independently verified and explicitly approved.
