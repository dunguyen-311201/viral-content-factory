import { CORRELATION_HEADER, type Logger, normalizeCorrelationId, runWithCorrelationId } from '@vcf/shared';
import type { NextFunction, Request, Response } from 'express';

/**
 * Assigns every request a correlation ID (reusing a safe inbound
 * `x-correlation-id`), echoes it on the response, makes it available to all
 * downstream code via AsyncLocalStorage, and logs one line per request.
 * Only method, path and status are logged — never bodies or query strings.
 */
export function correlationMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const correlationId = normalizeCorrelationId(req.headers[CORRELATION_HEADER]);
    const started = performance.now();
    res.setHeader(CORRELATION_HEADER, correlationId);

    runWithCorrelationId(correlationId, () => {
      res.on('finish', () => {
        const path = req.originalUrl.split('?')[0];
        runWithCorrelationId(correlationId, () =>
          logger.info(
            {
              method: req.method,
              path,
              statusCode: res.statusCode,
              durationMs: Math.round(performance.now() - started),
            },
            'request completed',
          ),
        );
      });
      next();
    });
  };
}
