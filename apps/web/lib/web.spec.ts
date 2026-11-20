import { fetchApiHealth, formatLocalTime } from './api-health';
import { parseWebEnv } from './env';

const jsonResponse = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

describe('parseWebEnv', () => {
  it('accepts a valid API_URL', () => {
    expect(parseWebEnv({ API_URL: 'http://localhost:4000' }).API_URL).toBe('http://localhost:4000');
  });

  it('fails fast with an actionable message', () => {
    expect(() => parseWebEnv({})).toThrow(/API_URL: is required/);
    expect(() => parseWebEnv({ API_URL: 'localhost:4000' })).toThrow(/must be an http\(s\) URL/);
  });
});

describe('fetchApiHealth', () => {
  const report = {
    status: 'degraded',
    service: 'api',
    version: '0.1.0',
    timestamp: '2026-11-20T00:00:00.000Z',
    checks: { database: { status: 'up', latencyMs: 2 }, redis: { status: 'down', latencyMs: 1 } },
  };

  it('returns the report and propagates the correlation id', async () => {
    const fetchImpl = jest.fn(async () => jsonResponse(503, report, { 'x-correlation-id': 'web-12345678' }));
    const result = await fetchApiHealth('http://localhost:4000', 'web-12345678', fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:4000/api/v1/health',
      expect.objectContaining({ headers: { 'x-correlation-id': 'web-12345678' } }),
    );
    expect(result).toMatchObject({ kind: 'reachable', httpStatus: 503, correlationId: 'web-12345678' });
  });

  it('reports unreachable instead of throwing', async () => {
    const result = await fetchApiHealth('http://localhost:4000', 'web-12345678', async () => {
      throw new Error('fetch failed');
    });
    expect(result).toEqual({ kind: 'unreachable', error: 'fetch failed' });
  });
});

describe('formatLocalTime', () => {
  it('displays UTC timestamps in Asia/Ho_Chi_Minh (UTC+7)', () => {
    expect(formatLocalTime('2026-11-20T00:00:00.000Z', 'Asia/Ho_Chi_Minh')).toContain('07:00:00');
  });
});
