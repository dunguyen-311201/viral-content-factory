import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

/** HTTP header used to propagate correlation IDs between web, API and worker. */
export const CORRELATION_HEADER = 'x-correlation-id';

export interface CorrelationContext {
  correlationId: string;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

const SAFE_ID = /^[A-Za-z0-9._:-]{8,128}$/;

/**
 * Accept a caller-provided ID only when it is a safe, bounded token;
 * otherwise generate a fresh UUID. This prevents log injection through headers.
 */
export function normalizeCorrelationId(candidate: unknown): string {
  const value = Array.isArray(candidate) ? candidate[0] : candidate;
  if (typeof value === 'string' && SAFE_ID.test(value)) return value;
  return randomUUID();
}

export function runWithCorrelationId<T>(correlationId: string, fn: () => T): T {
  return storage.run({ correlationId }, fn);
}

export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}
