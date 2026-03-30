import { lightModeTokens } from '../../../lib/design/tokens';

const users = [
  { name: 'Alex Rivera', email: 'alex@example.com', role: 'admin', status: 'active' },
  { name: 'Morgan Lee', email: 'morgan@example.com', role: 'editor', status: 'pending' },
  { name: 'Jordan Hall', email: 'jordan@example.com', role: 'viewer', status: 'active' },
];

export default function AdminUsersPage() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>User Management</h2>
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder='Search users…'
          aria-label='Search users'
          style={{
            minWidth: 220,
            padding: '.5rem .7rem',
            borderRadius: 8,
            border: `1px solid ${lightModeTokens.borderStrong}`,
          }}
        />
        <select
          aria-label='Filter by role'
          style={{ padding: '.5rem .7rem', borderRadius: 8, border: `1px solid ${lightModeTokens.borderStrong}` }}
        >
          <option>All roles</option>
          <option>Admin</option>
          <option>Editor</option>
          <option>Viewer</option>
        </select>
        <select
          aria-label='Filter by status'
          style={{ padding: '.5rem .7rem', borderRadius: 8, border: `1px solid ${lightModeTokens.borderStrong}` }}
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: lightModeTokens.surfaceMuted }}>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}>
              <td style={tdStyle}>{user.name}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>{user.role}</td>
              <td style={tdStyle}>{user.status}</td>
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
