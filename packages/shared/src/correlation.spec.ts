import { getCorrelationId, normalizeCorrelationId, runWithCorrelationId } from './correlation';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('normalizeCorrelationId', () => {
  it('keeps a safe caller-provided id', () => {
    expect(normalizeCorrelationId('req-12345678')).toBe('req-12345678');
    expect(normalizeCorrelationId(['abcdefgh-1', 'ignored'])).toBe('abcdefgh-1');
  });

  it.each([undefined, '', 'short', 'has space in it', 'evil\n{"level":"fatal"}', 'x'.repeat(129), 42])(
    'replaces unsafe value %p with a uuid',
    (value) => {
      expect(normalizeCorrelationId(value)).toMatch(UUID);
    },
  );
});

describe('runWithCorrelationId', () => {
  it('exposes the id across async boundaries and isolates concurrent runs', async () => {
    const seen = await Promise.all(
      ['corr-aaaaaaaa', 'corr-bbbbbbbb'].map((id) =>
        runWithCorrelationId(id, async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return getCorrelationId();
        }),
      ),
    );
    expect(seen).toEqual(['corr-aaaaaaaa', 'corr-bbbbbbbb']);
    expect(getCorrelationId()).toBeUndefined();
  });
});
