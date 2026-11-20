/** Fetches the API readiness report for the status page. */

export interface DependencyCheck {
  status: 'up' | 'down';
  latencyMs: number;
  error?: string;
}

export interface ApiHealthReport {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  timestamp: string;
  checks: Record<string, DependencyCheck>;
}

export type ApiHealthResult =
  | { kind: 'reachable'; httpStatus: number; report: ApiHealthReport; correlationId: string | null }
  | { kind: 'unreachable'; error: string };

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

function isReport(value: unknown): value is ApiHealthReport {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'checks' in value &&
    typeof (value as { checks: unknown }).checks === 'object'
  );
}

export async function fetchApiHealth(
  apiUrl: string,
  correlationId: string,
  fetchImpl: FetchLike = fetch,
  timeoutMs = 3000,
): Promise<ApiHealthResult> {
  try {
    const res = await fetchImpl(new URL('/api/v1/health', apiUrl).toString(), {
      cache: 'no-store',
      headers: { 'x-correlation-id': correlationId },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body: unknown = await res.json();
    if (!isReport(body)) return { kind: 'unreachable', error: `Unexpected response (HTTP ${res.status})` };
    return { kind: 'reachable', httpStatus: res.status, report: body, correlationId: res.headers.get('x-correlation-id') };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { kind: 'unreachable', error: message.slice(0, 200) };
  }
}

/** Format an ISO UTC timestamp for display in the operator's time zone. */
export function formatLocalTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(iso));
}
