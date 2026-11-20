import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apiEnvSchema, EnvValidationError, loadDotEnv, parseEnv, workerEnvSchema } from './env';

const valid = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/vcf',
  REDIS_URL: 'redis://localhost:6379',
  APP_URL: 'http://localhost:3000',
};

describe('parseEnv', () => {
  it('applies defaults for a minimal valid environment', () => {
    const env = parseEnv('api', apiEnvSchema, valid);
    expect(env).toMatchObject({
      NODE_ENV: 'development',
      API_PORT: 4000,
      LLM_PROVIDER: 'mock',
      TTS_PROVIDER: 'mock',
      APP_TIMEZONE: 'Asia/Ho_Chi_Minh',
      MONTHLY_BUDGET_VND: 3_000_000,
    });
  });

  it('fails fast with an actionable message listing every problem', () => {
    const run = () => parseEnv('api', apiEnvSchema, { REDIS_URL: 'http://wrong', API_PORT: 'abc' });
    expect(run).toThrow(EnvValidationError);
    try {
      run();
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain('[api] Invalid environment configuration');
      expect(message).toContain('DATABASE_URL: is required');
      expect(message).toContain('REDIS_URL: must be a valid redis: or rediss: URL');
      expect(message).toContain('API_PORT');
      expect(message).toContain('copy .env.example to .env');
      expect((error as EnvValidationError).problems.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('treats empty values as unset so defaults apply', () => {
    const env = parseEnv('worker', workerEnvSchema, { ...valid, WORKER_HEALTH_PORT: '', LLM_PROVIDER: '' });
    expect(env.WORKER_HEALTH_PORT).toBe(4001);
    expect(env.LLM_PROVIDER).toBe('mock');
  });

  it('rejects real (paid) providers until the Project Owner approves one', () => {
    expect(() => parseEnv('worker', workerEnvSchema, { ...valid, LLM_PROVIDER: 'openai' })).toThrow(
      /LLM_PROVIDER: is not supported\. Only "mock" is allowed/,
    );
    expect(() => parseEnv('worker', workerEnvSchema, { ...valid, TTS_PROVIDER: 'elevenlabs' })).toThrow(
      /TTS_PROVIDER/,
    );
  });

  it('requires a strong AUTH_SECRET in production', () => {
    expect(() => parseEnv('api', apiEnvSchema, { ...valid, NODE_ENV: 'production', AUTH_SECRET: 'replace_me' })).toThrow(
      /AUTH_SECRET: must be at least 32 random characters/,
    );
    const env = parseEnv('api', apiEnvSchema, { ...valid, NODE_ENV: 'production', AUTH_SECRET: 'x'.repeat(40) });
    expect(env.NODE_ENV).toBe('production');
  });

  it('does not echo secret values in errors', () => {
    try {
      parseEnv('api', apiEnvSchema, { ...valid, DATABASE_URL: 'mysql://user:supersecret@host/db' });
      fail('expected error');
    } catch (error) {
      expect((error as Error).message).not.toContain('supersecret');
    }
  });
});

describe('loadDotEnv', () => {
  it('finds the nearest .env walking up and does not override real env vars', () => {
    const root = mkdtempSync(join(tmpdir(), 'vcf-env-'));
    const nested = join(root, 'apps', 'api');
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(root, '.env'), 'VCF_TEST_FROM_FILE=file\nVCF_TEST_PRESET=file\n');
    process.env.VCF_TEST_PRESET = 'real';

    const loaded = loadDotEnv(nested);

    expect(loaded).toBe(join(root, '.env'));
    expect(process.env.VCF_TEST_FROM_FILE).toBe('file');
    expect(process.env.VCF_TEST_PRESET).toBe('real');
    delete process.env.VCF_TEST_FROM_FILE;
    delete process.env.VCF_TEST_PRESET;
  });

  it('returns undefined when no .env exists', () => {
    const empty = mkdtempSync(join(tmpdir(), 'vcf-noenv-'));
    expect(loadDotEnv(empty, 0)).toBeUndefined();
  });
});
