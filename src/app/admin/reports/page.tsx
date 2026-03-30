import { lightModeTokens } from '../../../lib/design/tokens';

const reports = [
  { id: 'RPT-201', type: 'Abuse', target: 'alex@example.com', state: 'open' },
  { id: 'RPT-202', type: 'Spam', target: 'theme:ocean-breeze', state: 'triage' },
  { id: 'RPT-203', type: 'Billing', target: 'org:northwind', state: 'resolved' },
];

export default function AdminReportsPage() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Report Queue</h2>
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder='Search by ID or target…'
          aria-label='Search reports'
          style={{ minWidth: 220, padding: '.5rem .7rem', borderRadius: 8, border: `1px solid ${lightModeTokens.borderStrong}` }}
        />
        <select aria-label='Filter report state' style={{ padding: '.5rem .7rem', borderRadius: 8, border: `1px solid ${lightModeTokens.borderStrong}` }}>
          <option>All states</option>
          <option>Open</option>
          <option>Triage</option>
          <option>Resolved</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: lightModeTokens.surfaceMuted }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Target</th>
            <th style={thStyle}>State</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td style={tdStyle}>{report.id}</td>
              <td style={tdStyle}>{report.type}</td>
              <td style={tdStyle}>{report.target}</td>
              <td style={tdStyle}>{report.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const thStyle = {
  textAlign: 'left' as const,
  padding: '.65rem',
  borderBottom: `1px solid ${lightModeTokens.border}`,
};

const tdStyle = {
  padding: '.65rem',
  borderBottom: `1px solid ${lightModeTokens.border}`,
};
