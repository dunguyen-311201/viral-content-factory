import { MockLlmProvider } from '@vcf/ai';
import {
  createLogger,
  DEFAULT_JOB_OPTIONS,
  DIAGNOSTIC_JOB_NAME,
  type DiagnosticJobData,
  type DiagnosticJobResult,
  loadDotEnv,
} from '@vcf/shared';
import { Queue, QueueEvents, Worker } from 'bullmq';
import { createDiagnosticProcessor } from '../src/diagnostic.processor';

/** Requires Redis (`docker compose up -d`). Uses an isolated queue name. */
loadDotEnv();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const PREFIX = 'vcf-test';
const QUEUE = `worker-int-${process.pid}`;
const connection = { url: REDIS_URL, maxRetriesPerRequest: null };

describe('worker processes jobs end to end through Redis', () => {
  let queue: Queue<DiagnosticJobData, DiagnosticJobResult>;
  let events: QueueEvents;
  let worker: Worker<DiagnosticJobData, DiagnosticJobResult>;
  let processed = 0;

  beforeAll(async () => {
    queue = new Queue(QUEUE, { prefix: PREFIX, connection, defaultJobOptions: DEFAULT_JOB_OPTIONS });
    events = new QueueEvents(QUEUE, { prefix: PREFIX, connection });
    const processor = createDiagnosticProcessor(new MockLlmProvider(), createLogger({ service: 't', level: 'silent' }));
    worker = new Worker(
      QUEUE,
      async (job) => {
        processed += 1;
        return processor(job);
      },
      { prefix: PREFIX, connection },
    );
    await Promise.all([events.waitUntilReady(), worker.waitUntilReady()]);
  });

  afterAll(async () => {
    await worker.close();
    await events.close();
    await queue.obliterate({ force: true });
    await queue.close();
  });

  it('runs the mock LLM and returns run metadata with the correlation id', async () => {
    const job = await queue.add(DIAGNOSTIC_JOB_NAME, {
      correlationId: 'int-worker-0001',
      input: 'Một câu chuyện công sở',
      requestedAt: new Date().toISOString(),
    });
    const result = await job.waitUntilFinished(events, 10_000);
    expect(result).toMatchObject({ provider: 'mock', correlationId: 'int-worker-0001', estimatedCostVnd: 0 });
  });

  it('deduplicates jobs that share a jobId (retry-safe enqueue)', async () => {
    const before = processed;
    const data = { correlationId: 'int-worker-0002', input: 'dup', requestedAt: new Date().toISOString() };
    const a = await queue.add(DIAGNOSTIC_JOB_NAME, data, { jobId: 'idem-dup-0001' });
    const b = await queue.add(DIAGNOSTIC_JOB_NAME, data, { jobId: 'idem-dup-0001' });
    expect(b.id).toBe(a.id);
    await a.waitUntilFinished(events, 10_000);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(processed - before).toBe(1);
  });
});
