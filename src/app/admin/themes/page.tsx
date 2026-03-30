import { lightModeTokens } from '../../../lib/design/tokens';

const themes = [
  { name: 'Nimbus Light', owner: 'Design Ops', updated: '2026-03-20', status: 'published' },
  { name: 'Quartz Neutral', owner: 'Brand Team', updated: '2026-03-12', status: 'draft' },
  { name: 'Ocean Breeze', owner: 'UX Team', updated: '2026-02-28', status: 'review' },
];

export default function AdminThemesPage() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Theme Management</h2>
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder='Filter themes…'
          aria-label='Filter themes'
          style={{ minWidth: 220, padding: '.5rem .7rem', borderRadius: 8, border: `1px solid ${lightModeTokens.borderStrong}` }}
        />
        <select aria-label='Status filter' style={{ padding: '.5rem .7rem', borderRadius: 8, border: `1px solid ${lightModeTokens.borderStrong}` }}>
          <option>All statuses</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Review</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: lightModeTokens.surfaceMuted }}>
          <tr>
            <th style={thStyle}>Theme</th>
            <th style={thStyle}>Owner</th>
            <th style={thStyle}>Updated</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {themes.map((theme) => (
            <tr key={theme.name}>
              <td style={tdStyle}>{theme.name}</td>
              <td style={tdStyle}>{theme.owner}</td>
              <td style={tdStyle}>{theme.updated}</td>
              <td style={tdStyle}>{theme.status}</td>
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
