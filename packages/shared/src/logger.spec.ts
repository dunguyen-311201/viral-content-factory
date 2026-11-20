import { Writable } from 'node:stream';
import { runWithCorrelationId } from './correlation';
import { createLogger } from './logger';

function capture() {
  const lines: Record<string, unknown>[] = [];
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(JSON.parse(chunk.toString()));
      callback();
    },
  });
  return { lines, destination };
}

describe('createLogger', () => {
  it('writes structured JSON with service, level and correlation id', () => {
    const { lines, destination } = capture();
    const logger = createLogger({ service: 'test', destination });

    runWithCorrelationId('corr-12345678', () => logger.info({ jobId: 'j1' }, 'job started'));

    expect(lines[0]).toMatchObject({
      service: 'test',
      level: 'info',
      correlationId: 'corr-12345678',
      jobId: 'j1',
      msg: 'job started',
    });
    expect(typeof lines[0].time).toBe('string');
  });

  it('redacts secrets', () => {
    const { lines, destination } = capture();
    const logger = createLogger({ service: 'test', destination });

    logger.info({ headers: { authorization: 'Bearer abc' }, provider: { apiKey: 'sk-123' } }, 'call');

    const serialized = JSON.stringify(lines[0]);
    expect(serialized).not.toContain('Bearer abc');
    expect(serialized).not.toContain('sk-123');
    expect(serialized).toContain('[REDACTED]');
  });
});
