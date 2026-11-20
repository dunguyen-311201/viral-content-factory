import { type DynamicModule, Global, Inject, Injectable, Module, type OnModuleDestroy } from '@nestjs/common';
import { type ApiEnv, DEFAULT_JOB_OPTIONS, type DiagnosticJobData, type Logger, QUEUE_NAMES } from '@vcf/shared';
import { Queue } from 'bullmq';
import IORedis, { type Redis } from 'ioredis';
import { API_ENV, DIAGNOSTICS_QUEUE, LOGGER, REDIS } from '../tokens';
import { PrismaService } from './prisma.service';

/**
 * Redis client for health checks. Commands issued while connecting are queued;
 * the health check's own timeout bounds how long a ping can wait.
 */
export function createHealthRedis(url: string, logger: Logger): Redis {
  const client = new IORedis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy: (times) => Math.min(times * 500, 5000),
  });
  let lastLogged = 0;
  client.on('error', (error) => {
    // Throttle reconnect noise to one line per 30s.
    if (Date.now() - lastLogged > 30_000) {
      lastLogged = Date.now();
      logger.warn({ dependency: 'redis', error: error.message }, 'redis connection error');
    }
  });
  return client;
}

@Injectable()
class InfraShutdown implements OnModuleDestroy {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(DIAGNOSTICS_QUEUE) private readonly queue: Queue,
  ) {}

  async onModuleDestroy() {
    await this.queue.close();
    this.redis.disconnect();
  }
}

/** Process-wide infrastructure: env, logger, PostgreSQL, Redis, queues. */
@Global()
@Module({})
export class InfraModule {
  static register(env: ApiEnv, logger: Logger): DynamicModule {
    return {
      module: InfraModule,
      providers: [
        { provide: API_ENV, useValue: env },
        { provide: LOGGER, useValue: logger },
        PrismaService,
        { provide: REDIS, useFactory: () => createHealthRedis(env.REDIS_URL, logger) },
        {
          provide: DIAGNOSTICS_QUEUE,
          useFactory: () =>
            new Queue<DiagnosticJobData>(QUEUE_NAMES.systemDiagnostics, {
              prefix: env.QUEUE_PREFIX,
              connection: { url: env.REDIS_URL, maxRetriesPerRequest: 1, connectTimeout: 2000 },
              defaultJobOptions: DEFAULT_JOB_OPTIONS,
            }),
        },
        InfraShutdown,
      ],
      exports: [API_ENV, LOGGER, PrismaService, REDIS, DIAGNOSTICS_QUEUE],
    };
  }
}
