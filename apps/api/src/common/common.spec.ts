import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { toErrorBody } from './all-exceptions.filter';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('toErrorBody', () => {
  it('maps HttpExceptions to the standard error shape', () => {
    const { status, body } = toErrorBody(new NotFoundException(), 'corr-12345678');
    expect(status).toBe(404);
    expect(body).toEqual({ code: 'NOT_FOUND', message: 'Not Found', correlationId: 'corr-12345678' });
  });

  it('keeps explicit codes and details', () => {
    const { body } = toErrorBody(
      new BadRequestException({ code: 'VALIDATION_ERROR', message: 'bad', details: [{ path: 'x' }] }),
      'corr-12345678',
    );
    expect(body).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'bad',
      details: [{ path: 'x' }],
      correlationId: 'corr-12345678',
    });
  });

  it('hides internal error details from clients', () => {
    const { status, body } = toErrorBody(new Error('password=hunter2 at db'), 'corr-12345678');
    expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('hunter2');
  });
});

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(z.object({ input: z.string().max(5).default('hi') }));

  it('returns parsed data with defaults', () => {
    expect(pipe.transform(undefined)).toEqual({ input: 'hi' });
  });

  it('throws a VALIDATION_ERROR with per-field details', () => {
    try {
      pipe.transform({ input: 'too long' });
      fail('expected error');
    } catch (error) {
      const response = (error as BadRequestException).getResponse() as Record<string, unknown>;
      expect(response.code).toBe('VALIDATION_ERROR');
      expect(response.details).toEqual([{ path: 'input', message: expect.any(String) }]);
    }
  });
});
