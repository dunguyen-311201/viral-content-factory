import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { HealthReport } from '@vcf/shared';
import type { Response } from 'express';
import { HealthService } from './health.service';

/** Public by design: exposes dependency up/down only, no secrets or data. */
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** Liveness: the process is up. Does not touch dependencies. */
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  /** Readiness: PostgreSQL and Redis status. 503 when any dependency is down. */
  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthReport> {
    const report = await this.health.check();
    res.status(report.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
