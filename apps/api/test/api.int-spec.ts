import type { INestApplication } from '@nestjs/common';
import { apiEnvSchema, createLogger, loadDotEnv, parseEnv, QUEUE_NAMES } from '@vcf/shared';
import { Queue } from 'bullmq';
import request from 'supertest';
import { createApp } from '../src/bootstrap';

/**
 * Integration tests against real PostgreSQL and Redis.
 * Start them first: `docker compose up -d`.
 */
loadDotEnv();
const env = parseEnv('api-int-test', apiEnvSchema, {
  ...process.env,
  NODE_ENV: 'test',
  QUEUE_PREFIX: 'vcf-test',
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/vcf',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  APP_URL: 'http://localhost:3000',
});
const logger = createLogger({ service: 'api-int-test', level: 'silent' });

describe('API with real dependencies', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp(env, logger);
    await app.init();
  });

  afterAll(async () => {
    const queue = new Queue(QUEUE_NAMES.systemDiagnostics, { prefix: 'vcf-test', connection: { url: env.REDIS_URL } });
    await queue.obliterate({ force: true });
    await queue.close();
    await app.close();
  });

  it('GET /api/v1/health reports PostgreSQL and Redis up', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'api',
      checks: { database: { status: 'up' }, redis: { status: 'up' } },
    });
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('enqueues a mock AI diagnostic job and echoes the correlation id', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/diagnostics/mock-ai-jobs')
      .set('x-correlation-id', 'int-test-0001')
      .send({ input: 'Xin chào' })
      .expect(202);
    expect(res.body).toMatchObject({ status: 'queued', correlationId: 'int-test-0001' });

    const status = await request(app.getHttpServer()).get(`/api/v1/diagnostics/mock-ai-jobs/${res.body.jobId}`).expect(200);
    expect(['waiting', 'active', 'completed', 'prioritized']).toContain(status.body.state);
  });

  it('does not create duplicate jobs for the same Idempotency-Key', async () => {
    const send = () =>
      request(app.getHttpServer())
        .post('/api/v1/diagnostics/mock-ai-jobs')
        .set('idempotency-key', 'same-key-123')
        .send({ input: 'retry me' })
        .expect(202);
    const first = await send();
    const second = await send();
    expect(second.body.jobId).toBe(first.body.jobId);
  });

  it('rejects invalid input with the standard validation error', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/diagnostics/mock-ai-jobs')
      .send({ input: 'x'.repeat(501) })
      .expect(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR', correlationId: expect.any(String) });
    expect(res.body.details[0].path).toBe('input');
  });
});

describe('API with Redis unavailable', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp({ ...env, REDIS_URL: 'redis://127.0.0.1:6399' }, logger);
    await app.init();
  });

  afterAll(() => app.close());

  it('still starts and reports degraded health with 503', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.checks.database.status).toBe('up');
    expect(res.body.checks.redis.status).toBe('down');
  });

  it('returns 503 QUEUE_UNAVAILABLE instead of hanging when enqueueing', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/diagnostics/mock-ai-jobs').send({}).expect(503);
    expect(res.body.code).toBe('QUEUE_UNAVAILABLE');
  });
});
