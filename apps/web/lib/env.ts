import { z } from 'zod';

/** Server-side web configuration. Validated in next.config.ts so `next dev` fails fast. */
export const webEnvSchema = z.object({
  API_URL: z
    .string({ error: 'is required (example: http://localhost:4000)' })
    .refine((value) => {
      try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, 'must be an http(s) URL (example: http://localhost:4000)'),
  APP_TIMEZONE: z.string().default('Asia/Ho_Chi_Minh'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export function parseWebEnv(source: Record<string, string | undefined> = process.env): WebEnv {
  const result = webEnvSchema.safeParse(
    Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined && value !== '')),
  );
  if (result.success) return result.data;
  const problems = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
  throw new Error(
    ['[web] Invalid environment configuration:', ...problems, 'Fix: copy .env.example to .env at the repository root.'].join(
      '\n',
    ),
  );
}
