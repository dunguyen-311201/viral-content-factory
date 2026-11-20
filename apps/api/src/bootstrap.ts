import 'reflect-metadata';
import { type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { type ApiEnv, CORRELATION_HEADER, type Logger } from '@vcf/shared';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { correlationMiddleware } from './common/correlation.middleware';
import { PinoLoggerService } from './common/pino-logger.service';

/** Builds a fully configured app. Shared by main.ts and integration tests. */
export async function createApp(env: ApiEnv, logger: Logger): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(env, logger), {
    logger: new PinoLoggerService(logger.child({ component: 'nest' })),
    bodyParser: false,
  });
  app.useBodyParser('json', { limit: '100kb' });
  app.use(correlationMiddleware(logger));
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.enableCors({
    origin: env.APP_URL,
    allowedHeaders: ['content-type', CORRELATION_HEADER, 'idempotency-key'],
    exposedHeaders: [CORRELATION_HEADER],
  });
  app.enableShutdownHooks();
  return app;
}
