import type { CSSProperties } from 'react';

import { analyticsService } from '@/lib/services/analytics-service';

export default async function AnalyticsDashboardPage() {
  const summary = await analyticsService.getSummary();

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 16 }}>Analytics</h1>

      <section
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginBottom: 24,
        }}
      >
        <Widget label="Total Page Views" value={summary.totalViews} />
        <Widget label="Total Clicks" value={summary.totalClicks} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Top Links by Clicks</h2>
        {summary.perLink.length === 0 ? (
          <p>No click data yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Link ID</th>
                <th style={thStyle}>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {summary.perLink.slice(0, 10).map((item) => (
                <tr key={item.linkId}>
                  <td style={tdStyle}>{item.linkId}</td>
                  <td style={tdStyle}>{item.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>Daily Trend</h2>
        {summary.daily.length === 0 ? (
          <p>No daily click trend data yet.</p>
        ) : (
          <ul>
            {summary.daily.map((entry) => (
              <li key={entry.date}>
                <strong>{entry.date}</strong>: {entry.clicks} clicks
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Widget({ label, value }: { label: string; value: number }) {
  return (
    <article
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        background: '#fff',
      }}
    >
      <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>{label}</p>
      <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700 }}>{value}</p>
    </article>
  );
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #f3f4f6',
};
