import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseEnv as parseDotEnv } from 'node:util';
import { z } from 'zod';

/**
 * Environment validation. Every process validates its environment at startup
 * and refuses to start with an actionable error (fail fast).
 */

const MOCK_ONLY_HINT =
  'Only "mock" is allowed until the Project Owner approves a real provider (see AGENTS.md approval gates).';

const port = (fallback: number) => z.coerce.number().int().min(1).max(65535).default(fallback);

const urlWithProtocol = (protocols: string[], example: string) =>
  z
    .string({ error: `is required (example: ${example})` })
    .trim()
    .min(1, `is required (example: ${example})`)
    .refine((value) => {
      try {
        return protocols.includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, `must be a valid ${protocols.join(' or ')} URL (example: ${example})`);

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  APP_TIMEZONE: z.string().default('Asia/Ho_Chi_Minh'),
  DATABASE_URL: urlWithProtocol(['postgresql:', 'postgres:'], 'postgresql://postgres:postgres@localhost:5432/vcf'),
  REDIS_URL: urlWithProtocol(['redis:', 'rediss:'], 'redis://localhost:6379'),
  QUEUE_PREFIX: z
    .string()
    .regex(/^[a-z0-9-]{1,32}$/, 'must be 1-32 lowercase letters, digits or dashes')
    .default('vcf'),
  AUTH_SECRET: z.string().optional(),
  LLM_PROVIDER: z.enum(['mock'], { error: `is not supported. ${MOCK_ONLY_HINT}` }).default('mock'),
  TTS_PROVIDER: z.enum(['mock'], { error: `is not supported. ${MOCK_ONLY_HINT}` }).default('mock'),
  MEDIA_STORAGE_DRIVER: z.enum(['local']).default('local'),
  MEDIA_STORAGE_PATH: z.string().min(1).default('./storage/media'),
  MONTHLY_BUDGET_VND: z.coerce.number().int().nonnegative().default(3_000_000),
});

/** Production must never run with a placeholder or weak secret. */
const withProductionGuards = <T extends z.ZodType<z.infer<typeof baseEnvSchema>>>(schema: T) =>
  schema.superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    const secret = env.AUTH_SECRET ?? '';
    if (secret.length < 32 || secret === 'replace_me') {
      ctx.addIssue({
        code: 'custom',
        path: ['AUTH_SECRET'],
        message: 'must be at least 32 random characters in production (e.g. `openssl rand -hex 32`)',
      });
    }
  });

export const apiEnvSchema = withProductionGuards(
  baseEnvSchema.extend({
    API_PORT: port(4000),
    APP_URL: urlWithProtocol(['http:', 'https:'], 'http://localhost:3000'),
  }),
);

export const workerEnvSchema = withProductionGuards(
  baseEnvSchema.extend({
    WORKER_HEALTH_PORT: port(4001),
    WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(16).default(2),
  }),
);

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export class EnvValidationError extends Error {
  constructor(
    public readonly service: string,
    public readonly problems: string[],
  ) {
    super(
      [
        `[${service}] Invalid environment configuration:`,
        ...problems.map((problem) => `  - ${problem}`),
        'Fix: copy .env.example to .env at the repository root and adjust the values above.',
      ].join('\n'),
    );
    this.name = 'EnvValidationError';
  }
}

type Source = Record<string, string | undefined>;

/** Treat empty strings as "not set" so `FOO=` in .env falls back to defaults. */
const withoutEmpty = (source: Source): Source =>
  Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined && value !== ''));

export function parseEnv<T extends z.ZodType>(
  service: string,
  schema: T,
  source: Source = process.env,
): z.infer<T> {
  const result = schema.safeParse(withoutEmpty(source));
  if (result.success) return result.data;
  const problems = result.error.issues.map((issue) => {
    const key = issue.path.join('.') || '(root)';
    return `${key}: ${issue.message}`;
  });
  throw new EnvValidationError(service, problems);
}

/**
 * Load the nearest `.env` (walking up from `startDir`) into process.env.
 * Values that are already set in the real environment win.
 * Returns the loaded path, or undefined when no file was found.
 */
export function loadDotEnv(startDir: string = process.cwd(), maxLevels = 4): string | undefined {
  let dir = resolve(startDir);
  for (let level = 0; level <= maxLevels; level += 1) {
    const candidate = join(dir, '.env');
    if (existsSync(candidate)) {
      const values = parseDotEnv(readFileSync(candidate, 'utf8'));
      for (const [key, value] of Object.entries(values)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}
