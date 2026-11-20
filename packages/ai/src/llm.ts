import { createHash } from 'node:crypto';

/**
 * Provider-agnostic LLM boundary (ADR-007). Business logic depends on this
 * interface, never on a vendor SDK. Every result carries the metadata the
 * constitution requires us to persist for each AI run.
 */
export interface LlmRequest {
  /** Stable prompt identifier from the prompt registry, e.g. `trend-analyst.brief`. */
  promptId: string;
  promptVersion: string;
  /** Trusted operator/system instructions. */
  system: string;
  /** Untrusted data (source text, notes). Must never be treated as instructions. */
  untrustedInput: string;
  maxOutputTokens?: number;
}

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface LlmResult {
  provider: string;
  model: string;
  promptId: string;
  promptVersion: string;
  output: string;
  usage: LlmUsage;
  latencyMs: number;
  estimatedCostVnd: number;
}

export interface LlmProvider {
  readonly name: string;
  generate(request: LlmRequest): Promise<LlmResult>;
}

/** Rough token estimate good enough for mock accounting (≈4 chars per token). */
export const estimateTokens = (text: string): number => Math.max(1, Math.ceil(text.length / 4));

/**
 * Deterministic, free, offline provider for development and tests.
 * Same input → same output, so retries are reproducible.
 */
export class MockLlmProvider implements LlmProvider {
  readonly name = 'mock';
  private readonly model = 'mock-llm-v0';

  async generate(request: LlmRequest): Promise<LlmResult> {
    const started = performance.now();
    const digest = createHash('sha256')
      .update(`${request.promptId}@${request.promptVersion}\n${request.untrustedInput}`)
      .digest('hex')
      .slice(0, 12);
    const preview = request.untrustedInput.replace(/\s+/g, ' ').trim().slice(0, 80);
    const output = `[mock:${digest}] Received ${request.untrustedInput.length} chars for ${request.promptId}: "${preview}"`;
    const outputTokens = Math.min(estimateTokens(output), request.maxOutputTokens ?? Number.MAX_SAFE_INTEGER);
    return {
      provider: this.name,
      model: this.model,
      promptId: request.promptId,
      promptVersion: request.promptVersion,
      output,
      usage: { inputTokens: estimateTokens(request.system + request.untrustedInput), outputTokens },
      latencyMs: Math.round(performance.now() - started),
      estimatedCostVnd: 0,
    };
  }
}
