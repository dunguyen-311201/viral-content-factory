import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { getCorrelationId, type Logger, normalizeCorrelationId } from '@vcf/shared';
import type { Response } from 'express';

/** Standard error shape (HLD §7). */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
  correlationId: string;
}

const CODE_BY_STATUS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function toErrorBody(exception: unknown, correlationId: string): { status: number; body: ApiErrorBody } {
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const fallbackCode = CODE_BY_STATUS[status] ?? (status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR');
    if (isRecord(response)) {
      const message = Array.isArray(response.message)
        ? response.message.join('; ')
        : String(response.message ?? exception.message);
      return {
        status,
        body: {
          code: typeof response.code === 'string' ? response.code : fallbackCode,
          message,
          ...(response.details !== undefined ? { details: response.details } : {}),
          correlationId,
        },
      };
    }
    return { status, body: { code: fallbackCode, message: String(response), correlationId } };
  }
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', correlationId },
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const correlationId = getCorrelationId() ?? normalizeCorrelationId(res.getHeader('x-correlation-id'));
    const { status, body } = toErrorBody(exception, correlationId);

    if (status >= 500) {
      // Internal details go to logs (with correlation ID), never to the client.
      this.logger.error({ err: exception, code: body.code }, 'request failed');
    }
    res.status(status).json(body);
  }
}
