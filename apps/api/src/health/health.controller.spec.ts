import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createLogger, type HealthReport } from '@vcf/shared';
import request from 'supertest';
import { AllExceptionsFilter } from '../common/all-exceptions.filter';
import { correlationMiddleware } from '../common/correlation.middleware';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

const report = (status: HealthReport['status']): HealthReport => ({
  status,
  service: 'api',
  version: 'test',
  timestamp: new Date().toISOString(),
  uptimeSeconds: 1,
  checks: {
    database: { status: 'up', latencyMs: 1 },
    redis: status === 'ok' ? { status: 'up', latencyMs: 1 } : { status: 'down', latencyMs: 1, error: 'ECONNREFUSED' },
  },
});

describe('HealthController (HTTP)', () => {
  let app: INestApplication;
  const fakeHealth = { check: jest.fn<Promise<HealthReport>, []>() };

  beforeAll(async () => {
    const logger = createLogger({ service: 'api-test', level: 'silent' });
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: fakeHealth }],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    app.use(correlationMiddleware(logger));
    app.useGlobalFilters(new AllExceptionsFilter(logger));
    await app.init();
  });

  afterAll(() => app.close());

  it('returns 200 when all dependencies are up', async () => {
    fakeHealth.check.mockResolvedValueOnce(report('ok'));
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.headers['x-correlation-id']).toBeDefined();
  });

  it('returns 503 with per-dependency status when degraded', async () => {
    fakeHealth.check.mockResolvedValueOnce(report('degraded'));
    const res = await request(app.getHttpServer()).get('/health').expect(503);
    expect(res.body.checks.redis).toMatchObject({ status: 'down', error: 'ECONNREFUSED' });
  });

  it('propagates a safe inbound correlation id', async () => {
    const res = await request(app.getHttpServer()).get('/health/live').set('x-correlation-id', 'web-abc12345');
    expect(res.status).toBe(200);
    expect(res.headers['x-correlation-id']).toBe('web-abc12345');
  });

  it('uses the standard error shape for unknown routes', async () => {
    const res = await request(app.getHttpServer()).get('/nope').set('x-correlation-id', 'web-abc12345');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ code: 'NOT_FOUND', message: expect.any(String), correlationId: 'web-abc12345' });
  });
});
