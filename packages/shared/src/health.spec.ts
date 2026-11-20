import { buildHealthReport, runDependencyCheck, sanitizeError } from './health';

describe('runDependencyCheck', () => {
  it('reports up with latency', async () => {
    const result = await runDependencyCheck(async () => 'PONG');
    expect(result.status).toBe('up');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeUndefined();
  });

  it('reports down with a sanitized error instead of throwing', async () => {
    const result = await runDependencyCheck(async () => {
      throw new Error('connect ECONNREFUSED postgresql://user:pass@db:5432/vcf');
    });
    expect(result.status).toBe('down');
    expect(result.error).toBe('connect ECONNREFUSED [url]');
  });

  it('times out slow checks', async () => {
    const result = await runDependencyCheck(() => new Promise(() => undefined), 20);
    expect(result).toMatchObject({ status: 'down', error: 'timed out after 20ms' });
  });
});

describe('buildHealthReport', () => {
  it('is ok only when every dependency is up', async () => {
    const ok = await buildHealthReport('api', '0.1.0', { database: async () => 1, redis: async () => 'PONG' });
    expect(ok.status).toBe('ok');
    expect(Object.keys(ok.checks)).toEqual(['database', 'redis']);

    const degraded = await buildHealthReport('api', '0.1.0', {
      database: async () => 1,
      redis: async () => {
        throw new Error('down');
      },
    });
    expect(degraded.status).toBe('degraded');
    expect(degraded.checks.redis.status).toBe('down');
  });
});

describe('sanitizeError', () => {
  it('keeps the first line only and caps length', () => {
    expect(sanitizeError(new Error('first\nsecond'))).toBe('first');
    expect(sanitizeError('x'.repeat(500))).toHaveLength(200);
  });
});
