/** Dependency health-check primitives shared by the API and the worker. */

export type DependencyStatus = 'up' | 'down';

export interface DependencyCheckResult {
  status: DependencyStatus;
  latencyMs: number;
  /** Short, non-sensitive reason. Never include connection strings. */
  error?: string;
}

export interface HealthReport {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  checks: Record<string, DependencyCheckResult>;
}

export type DependencyCheck = () => Promise<unknown>;

class CheckTimeoutError extends Error {
  constructor(ms: number) {
    super(`timed out after ${ms}ms`);
  }
}

/** Reject with `timed out after Nms` if the promise does not settle in time. */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new CheckTimeoutError(timeoutMs)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Run one check with a timeout; never throws. */
export async function runDependencyCheck(check: DependencyCheck, timeoutMs = 2000): Promise<DependencyCheckResult> {
  const started = performance.now();
  try {
    await withTimeout(check(), timeoutMs);
    return { status: 'up', latencyMs: Math.round(performance.now() - started) };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Math.round(performance.now() - started),
      error: sanitizeError(error),
    };
  }
}

export async function buildHealthReport(
  service: string,
  version: string,
  checks: Record<string, DependencyCheck>,
  timeoutMs?: number,
): Promise<HealthReport> {
  const entries = await Promise.all(
    Object.entries(checks).map(async ([name, check]) => [name, await runDependencyCheck(check, timeoutMs)] as const),
  );
  const results = Object.fromEntries(entries);
  const allUp = entries.every(([, result]) => result.status === 'up');
  return {
    status: allUp ? 'ok' : 'degraded',
    service,
    version,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checks: results,
  };
}

/** Strip anything that looks like a URL with credentials and cap the length. */
export function sanitizeError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const firstLine = raw.split('\n').find((line) => line.trim().length > 0) ?? 'unknown error';
  return firstLine.replace(/[a-z]+:\/\/[^\s]+/gi, '[url]').slice(0, 200);
}
