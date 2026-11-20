import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  DIAGNOSTIC_JOB_NAME,
  type DiagnosticJobData,
  type DiagnosticJobResult,
  getCorrelationId,
  type Logger,
  normalizeCorrelationId,
  sanitizeError,
  withTimeout,
} from '@vcf/shared';
import type { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { DIAGNOSTICS_QUEUE, LOGGER } from '../tokens';

export const createMockJobSchema = z.object({
  input: z.string().trim().min(1).max(500).default('Xin chào từ Viral Content Factory'),
});
type CreateMockJobDto = z.infer<typeof createMockJobSchema>;

const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,64}$/;
const ENQUEUE_TIMEOUT_MS = 3000;
const JOB_ID = /^[A-Za-z0-9_-]{1,80}$/;

/**
 * Development-only smoke test of the async pipeline:
 * API → Redis/BullMQ → worker → mock LLM provider → result.
 * Not registered when NODE_ENV=production. No business data is stored.
 */
@Controller('diagnostics/mock-ai-jobs')
export class DiagnosticsController {
  constructor(
    @Inject(DIAGNOSTICS_QUEUE) private readonly queue: Queue<DiagnosticJobData, DiagnosticJobResult>,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(
    @Body(new ZodValidationPipe(createMockJobSchema)) body: CreateMockJobDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (idempotencyKey !== undefined && !IDEMPOTENCY_KEY.test(idempotencyKey)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Idempotency-Key must be 8-64 characters of letters, digits, "-" or "_".',
      });
    }
    const correlationId = getCorrelationId() ?? normalizeCorrelationId(undefined);
    // Same Idempotency-Key → same BullMQ jobId → BullMQ will not create a duplicate job.
    const jobId = idempotencyKey ? `idem-${idempotencyKey}` : randomUUID();
    try {
      // Bounded wait so a Redis outage yields a fast 503 instead of a hung request.
      const job = await withTimeout(
        this.queue.add(
          DIAGNOSTIC_JOB_NAME,
          { correlationId, input: body.input, requestedAt: new Date().toISOString() },
          { jobId },
        ),
        ENQUEUE_TIMEOUT_MS,
      );
      this.logger.info({ jobId: job.id, queue: this.queue.name }, 'diagnostic job enqueued');
      return { jobId: job.id, status: 'queued', correlationId };
    } catch (error) {
      this.logger.warn({ error: sanitizeError(error) }, 'failed to enqueue diagnostic job');
      throw new ServiceUnavailableException({ code: 'QUEUE_UNAVAILABLE', message: 'Job queue is unavailable.' });
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const job = JOB_ID.test(id) ? await this.queue.getJob(id) : undefined;
    if (!job) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Diagnostic job not found.' });
    return {
      jobId: job.id,
      state: await job.getState(),
      attemptsMade: job.attemptsMade,
      result: job.returnvalue ?? null,
      failedReason: job.failedReason ?? null,
    };
  }
}
