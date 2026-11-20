/**
 * Queue names from docs/architecture/HLD.md §8. Product queues are reserved
 * here so names stay stable; Sprint 0 only processes `system-diagnostics`.
 */
export const QUEUE_NAMES = {
  systemDiagnostics: 'system-diagnostics',
  aiAnalysis: 'ai-analysis',
  contentGeneration: 'content-generation',
  qualityReview: 'quality-review',
  mediaRender: 'media-render',
  analyticsImport: 'analytics-import',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const DIAGNOSTIC_JOB_NAME = 'mock-ai-echo';

/** Payload for the Sprint 0 smoke job that proves API → Redis → worker → mock LLM. */
export interface DiagnosticJobData {
  correlationId: string;
  input: string;
  requestedAt: string;
}

export interface DiagnosticJobResult {
  provider: string;
  model: string;
  promptId: string;
  promptVersion: string;
  output: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCostVnd: number;
  correlationId: string;
}

/** Bounded retries with exponential backoff (HLD §8). */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnComplete: { age: 24 * 3600, count: 1000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};
