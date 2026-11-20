import type { HealthReport } from '@vcf/shared';
import { createServer, type Server } from 'node:http';

/**
 * Minimal HTTP readiness endpoint for the worker (no framework needed):
 *   GET /health       → dependency report, 200 or 503
 *   GET /health/live  → process liveness
 */
export function createHealthServer(getReport: () => Promise<HealthReport>): Server {
  return createServer(async (req, res) => {
    const path = (req.url ?? '/').split('?')[0];
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'GET') return send(405, { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' });
    if (path === '/health/live') return send(200, { status: 'ok' });
    if (path === '/health') {
      try {
        const report = await getReport();
        return send(report.status === 'ok' ? 200 : 503, report);
      } catch {
        return send(503, { status: 'degraded', service: 'worker' });
      }
    }
    return send(404, { code: 'NOT_FOUND', message: 'Not found.' });
  });
}
