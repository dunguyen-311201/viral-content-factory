import { randomUUID } from 'node:crypto';
import { fetchApiHealth, formatLocalTime } from '../lib/api-health';
import { parseWebEnv } from '../lib/env';

// Always render on request so the status is live.
export const dynamic = 'force-dynamic';

const badge = (up: boolean) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  background: up ? '#dcfce7' : '#fee2e2',
  color: up ? '#166534' : '#991b1b',
});

export default async function StatusPage() {
  const env = parseWebEnv();
  const correlationId = `web-${randomUUID()}`;
  const health = await fetchApiHealth(env.API_URL, correlationId);

  return (
    <main style={{ maxWidth: 640, margin: '48px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Viral Content Factory</h1>
      <p style={{ color: '#52525b', marginTop: 0 }}>
        Sprint 0 foundation: system status. Product features arrive in later sprints.
      </p>

      <section style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>API and dependencies</h2>
        {health.kind === 'unreachable' ? (
          <p>
            <span style={badge(false)}>API unreachable</span>{' '}
            <span style={{ color: '#52525b' }}>
              Start it with <code>npm run dev:api</code>. ({health.error})
            </span>
          </p>
        ) : (
          <>
            <p>
              <span style={badge(health.report.status === 'ok')}>
                {health.report.status === 'ok' ? 'All systems ready' : 'Degraded'}
              </span>{' '}
              <span style={{ color: '#52525b', fontSize: 13 }}>
                API v{health.report.version} · checked {formatLocalTime(health.report.timestamp, env.APP_TIMEZONE)}
              </span>
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#71717a' }}>
                  <th style={{ padding: '6px 0' }}>Dependency</th>
                  <th>Status</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(health.report.checks).map(([name, check]) => (
                  <tr key={name} style={{ borderTop: '1px solid #f4f4f5' }}>
                    <td style={{ padding: '6px 0' }}>{name}</td>
                    <td>
                      <span style={badge(check.status === 'up')}>{check.status}</span>
                      {check.error ? <span style={{ color: '#71717a', fontSize: 12 }}> {check.error}</span> : null}
                    </td>
                    <td>{check.latencyMs} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 0 }}>Correlation ID: {correlationId}</p>
      </section>
    </main>
  );
}
