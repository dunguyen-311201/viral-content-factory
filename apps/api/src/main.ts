import { apiEnvSchema, createLogger, EnvValidationError, loadDotEnv, parseEnv } from '@vcf/shared';
import { createApp } from './bootstrap';

async function main() {
  loadDotEnv();
  let env;
  try {
    env = parseEnv('api', apiEnvSchema);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }

  const logger = createLogger({ service: 'api', level: env.LOG_LEVEL });
  const app = await createApp(env, logger);
  await app.listen(env.API_PORT);
  logger.info(
    { port: env.API_PORT, nodeEnv: env.NODE_ENV, llmProvider: env.LLM_PROVIDER, ttsProvider: env.TTS_PROVIDER },
    `API listening on http://localhost:${env.API_PORT}/api/v1`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`[api] fatal startup error: ${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
