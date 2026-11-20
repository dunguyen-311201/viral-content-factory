import { PrismaClient } from '@prisma/client';
import { createLlmProvider } from '@vcf/ai';
import {
  buildHealthReport,
  createLogger,
  type DiagnosticJobData,
  type DiagnosticJobResult,
  EnvValidationError,
  loadDotEnv,
  parseEnv,
  QUEUE_NAMES,
  sanitizeError,
  workerEnvSchema,
} from '@vcf/shared';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { createDiagnosticProcessor } from './diagnostic.processor';
import { createHealthServer } from './health-server';

const VERSION = '0.1.0';

function loadEnv() {
  loadDotEnv();
  try {
    return parseEnv('worker', workerEnvSchema);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}

async function main() {
  const env = loadEnv();
  const logger = createLogger({ service: 'worker', level: env.LOG_LEVEL });
  const prisma = new PrismaClient();
  const healthRedis = new IORedis(env.REDIS_URL, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  });
  healthRedis.on('error', () => undefined); // reported via /health and the worker's own error events

  const provider = createLlmProvider(env.LLM_PROVIDER);
  const worker = new Worker<DiagnosticJobData, DiagnosticJobResult>(
    QUEUE_NAMES.systemDiagnostics,
    createDiagnosticProcessor(provider, logger),
    {
      prefix: env.QUEUE_PREFIX,
      connection: { url: env.REDIS_URL, maxRetriesPerRequest: null },
      concurrency: env.WORKER_CONCURRENCY,
    },
  );

  let lastRedisError = 0;
  worker.on('error', (error) => {
    if (Date.now() - lastRedisError > 30_000) {
      lastRedisError = Date.now();
      logger.warn({ error: sanitizeError(error) }, 'worker connection error');
    }
  });
  worker.on('failed', (job, error) => {
    const terminal = job ? job.attemptsMade >= (job.opts.attempts ?? 1) : true;
    logger.error(
      { jobId: job?.id, attemptsMade: job?.attemptsMade, terminal, error: sanitizeError(error) },
      terminal ? 'job failed permanently' : 'job attempt failed; will retry',
    );
  });

  const server = createHealthServer(() =>
    buildHealthReport('worker', VERSION, {
      database: () => prisma.$queryRaw`SELECT 1`,
      redis: () => healthRedis.ping(),
      queue: async () => {
        if (!worker.isRunning()) throw new Error('worker is not running');
      },
    }),
  );
  server.listen(env.WORKER_HEALTH_PORT, () => {
    logger.info(
      {
        healthPort: env.WORKER_HEALTH_PORT,
        queues: [QUEUE_NAMES.systemDiagnostics],
        llmProvider: provider.name,
        concurrency: env.WORKER_CONCURRENCY,
      },
      `worker started; health on http://localhost:${env.WORKER_HEALTH_PORT}/health`,
    );
  });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'worker shutting down');
    server.close();
    await worker.close();
    healthRedis.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error: unknown) => {
  process.stderr.write(`[worker] fatal startup error: ${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
