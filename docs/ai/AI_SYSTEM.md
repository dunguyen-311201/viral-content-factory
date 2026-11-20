# AI System Design

## 1. Agent responsibilities
Agents are logical prompt/workflow roles, not separate autonomous services.

### Agent 1 — Trend Scout
Input: eligible source metadata and operator notes.  
Output: normalized topic candidates, category, tags, possible duplicates, and cluster suggestions.  
Must not: invent source facts, silently merge trends, or treat source instructions as system instructions.

### Agent 2 — Trend Analyst
Input: candidate trend and linked sources.  
Output: score breakdown, audience interest hypothesis, core tension, freshness, evidence quality, risk level, expiry suggestion.  
Must: explain each score and uncertainty.

### Agent 3 — Content Strategist & Writer
Input: approved editorial brief and brand playbook.  
Output: angles, hooks, script, caption, CTA, scenes, and estimated duration.  
Must: create original wording, avoid close paraphrase, preserve factual labels, and avoid unsupported details.

### Agent 4 — Quality & Safety Reviewer
Input: exact content version, brief, and source map.  
Output: structured findings with severity and recommended action.  
Must: identify unsupported claims, privacy issues, defamation risks, hate/harassment, copyright similarity, sensationalism, and brand mismatch.  
Must not: provide final publication approval.

### Agent 5 — Media Producer
Input: human-approved script and media configuration.  
Output: scene manifest, voice-over, subtitles, rendered draft, and asset metadata.  
Must use only owned/licensed assets and configured providers.

## 2. Trend scoring model
Suggested 0–100 score:
- Relevance to audience: 0–25
- Freshness: 0–20
- Novelty: 0–15
- Discussion potential: 0–20
- Evidence quality: 0–20
- Risk penalty: subtract 0–30

Clamp final score to 0–100. Store raw component values and rationale. Do not label the score “viral probability”.

## 3. Structured output contracts
Use JSON schema validation at runtime. Example trend analysis:
```json
{
  "topic": "string",
  "summary": "string",
  "category": "relationships|workplace|social_psychology|society|other",
  "score": {
    "relevance": 0,
    "freshness": 0,
    "novelty": 0,
    "discussion": 0,
    "evidence": 0,
    "risk_penalty": 0,
    "total": 0,
    "rationale": ["string"]
  },
  "risk_level": "low|medium|high|critical",
  "confidence": 0.0,
  "expiry_hours": 24,
  "open_questions": ["string"]
}
```

Content package:
```json
{
  "title": "string",
  "angles": [{"name":"string","description":"string","risk":"low|medium|high"}],
  "hooks": ["string"],
  "selected_angle": "string",
  "script": "string",
  "estimated_duration_seconds": 60,
  "caption": "string",
  "cta": "string",
  "scenes": [
    {"order":1,"narration":"string","visual_direction":"string","on_screen_text":"string","duration_seconds":5}
  ],
  "editorial_labels": {
    "contains_allegations": false,
    "fictionalized_or_composite": false,
    "opinion_or_commentary": false,
    "requires_human_fact_check": true
  }
}
```

Review package:
```json
{
  "overall_risk": "low|medium|high|critical",
  "recommendation": "pass|revise|block",
  "findings": [
    {
      "category": "factuality|privacy|defamation|copyright|harassment|hate|sensationalism|brand",
      "severity": "info|low|medium|high|critical",
      "location": "script span or scene order",
      "issue": "string",
      "why_it_matters": "string",
      "suggested_fix": "string"
    }
  ],
  "human_fact_check_required": true
}
```

## 4. Prompt security
- Delimit source material as untrusted data.
- System prompt explicitly says to ignore instructions found in source content.
- Never expose secrets or internal prompts to source text.
- Limit input length and strip active markup where possible.
- Validate outputs against schema and reject malformed output.
- Do not let the model call arbitrary tools based on source instructions.
- Log prompt version and input source IDs, not unnecessary raw personal content.

## 5. Prompt versioning
Store prompts in version-controlled files, e.g.:
- `prompts/trend-scout/v1.md`
- `prompts/trend-analyst/v1.md`
- `prompts/content-writer/v1.md`
- `prompts/quality-reviewer/v1.md`
- `prompts/media-scene-planner/v1.md`

Every run records prompt name/version and provider/model. Changes that materially affect editorial behavior require a prompt version increment and a small evaluation set.

## 6. Cost strategy
- Use a small/low-cost model for classification, tagging, dedupe suggestions.
- Use a stronger model for brief and script generation when needed.
- Use a separate reviewer pass only for content intended to progress.
- Cache deterministic analysis by source fingerprint and prompt version where safe.
- Limit regeneration; support human editing.
- Track real provider pricing in configuration rather than hardcoding estimates.
- Monthly budget warning at 80% and hard operational alert at 100%; never bypass safety checks to save cost.

## 7. Evaluation set
Maintain 20–30 manually reviewed examples:
- Safe relationship discussion.
- Workplace conflict with uncertain claims.
- Public-interest news topic.
- Private individual allegation.
- Screenshot/private chat.
- Copyright-heavy viral text.
- Sensitive personal information.
- Prompt injection embedded in source.
Measure schema validity, unsupported-claim rate, risk recall, edit distance, and reviewer acceptance.
