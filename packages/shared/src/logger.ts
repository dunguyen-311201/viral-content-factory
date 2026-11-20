import pino, { type DestinationStream, type Logger, type LoggerOptions } from 'pino';
import { getCorrelationId } from './correlation';

export type { Logger } from 'pino';

/**
 * Keys whose values must never reach logs. Log identifiers and state
 * transitions, not secrets or unnecessary personal content.
 */
export const REDACTED_PATHS = [
  'password',
  'token',
  'apiKey',
  'authorization',
  'cookie',
  '*.password',
  '*.token',
  '*.apiKey',
  '*.authorization',
  '*.cookie',
  'headers.authorization',
  'headers.cookie',
  'req.headers.authorization',
  'req.headers.cookie',
];

export interface CreateLoggerOptions {
  service: string;
  level?: LoggerOptions['level'];
  destination?: DestinationStream;
}

/** Structured JSON logger; every line carries the active correlation ID. */
export function createLogger({ service, level = 'info', destination }: CreateLoggerOptions): Logger {
  const options: LoggerOptions = {
    level,
    base: { service },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACTED_PATHS, censor: '[REDACTED]' },
    formatters: { level: (label) => ({ level: label }) },
    mixin() {
      const correlationId = getCorrelationId();
      return correlationId ? { correlationId } : {};
    },
  };
  return destination ? pino(options, destination) : pino(options);
}
