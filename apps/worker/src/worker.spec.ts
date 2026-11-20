import { MockLlmProvider } from '@vcf/ai';
import { createLogger, type HealthReport } from '@vcf/shared';
import type { AddressInfo } from 'node:net';
import { createDiagnosticProcessor } from './diagnostic.processor';
import { createHealthServer } from './health-server';

const logger = createLogger({ service: 'worker-test', level: 'silent' });

describe('diagnostic processor', () => {
  const processor = createDiagnosticProcessor(new MockLlmProvider(), logger);
  const job = {
    id: 'job-1',
    attemptsMade: 0,
    data: { correlationId: 'corr-12345678', input: 'Xin chào', requestedAt: new Date().toISOString() },
  };

  it('returns AI run metadata with the job correlation id', async () => {
    const result = await processor(job);
    expect(result).toMatchObject({
      provider: 'mock',
      model: 'mock-llm-v0',
      promptId: 'diagnostics.echo',
      promptVersion: 'v0',
      estimatedCostVnd: 0,
      correlationId: 'corr-12345678',
    });
    expect(result.inputTokens).toBeGreaterThan(0);
  });

  it('is idempotent: a retry yields the same output', async () => {
    const first = await processor(job);
    const retry = await processor({ ...job, attemptsMade: 1 });
    expect(retry.output).toBe(first.output);
  });

  it('replaces an unsafe correlation id from job data', async () => {
    const result = await processor({ ...job, data: { ...job.data, correlationId: 'bad id\n' } });
    expect(result.correlationId).not.toContain('\n');
  });
});

describe('worker health server', () => {
  const report = (status: HealthReport['status']): HealthReport => ({
    status,
    service: 'worker',
    version: 'test',
    timestamp: new Date().toISOString(),
    uptimeSeconds: 1,
    checks: { redis: { status: status === 'ok' ? 'up' : 'down', latencyMs: 1 } },
  });

  async function withServer(status: HealthReport['status'], fn: (base: string) => Promise<void>) {
    const server = createHealthServer(async () => report(status));
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    try {
      await fn(`http://127.0.0.1:${port}`);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }

  it('returns 200 when ready and 503 when degraded', async () => {
    await withServer('ok', async (base) => {
      expect((await fetch(`${base}/health`)).status).toBe(200);
      expect((await fetch(`${base}/health/live`)).status).toBe(200);
      expect((await fetch(`${base}/other`)).status).toBe(404);
    });
    await withServer('degraded', async (base) => {
      const res = await fetch(`${base}/health`);
      expect(res.status).toBe(503);
      const body = (await res.json()) as HealthReport;
      expect(body.checks.redis.status).toBe('down');
    });
  });
});
