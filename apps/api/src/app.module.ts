import { type DynamicModule, Module } from '@nestjs/common';
import type { ApiEnv, Logger } from '@vcf/shared';
import { DiagnosticsController } from './diagnostics/diagnostics.controller';
import { HealthModule } from './health/health.module';
import { InfraModule } from './infra/infra.module';

@Module({})
export class AppModule {
  static register(env: ApiEnv, logger: Logger): DynamicModule {
    // The diagnostics endpoint is a local smoke test; never expose it in production.
    const diagnosticsEnabled = env.NODE_ENV !== 'production';
    return {
      module: AppModule,
      imports: [InfraModule.register(env, logger), HealthModule],
      controllers: diagnosticsEnabled ? [DiagnosticsController] : [],
    };
  }
}
