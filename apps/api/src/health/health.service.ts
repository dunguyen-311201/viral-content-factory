import { Inject, Injectable } from '@nestjs/common';
import { buildHealthReport, type HealthReport } from '@vcf/shared';
import type { Redis } from 'ioredis';
import { PrismaService } from '../infra/prisma.service';
import { API_VERSION, REDIS } from '../tokens';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  check(): Promise<HealthReport> {
    return buildHealthReport('api', API_VERSION, {
      database: () => this.prisma.ping(),
      redis: () => this.redis.ping(),
    });
  }
}
