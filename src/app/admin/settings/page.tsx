import { lightModeTokens } from '../../../lib/design/tokens';

export default function AdminSettingsPage() {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Admin Settings</h2>
      <p style={{ color: lightModeTokens.textSecondary }}>
        Configure global moderation and access defaults.
      </p>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        <label style={fieldStyle}>
          Session timeout (minutes)
          <input defaultValue='60' style={inputStyle} />
        </label>

        <label style={fieldStyle}>
          Default review SLA (hours)
          <input defaultValue='24' style={inputStyle} />
        </label>

        <label style={fieldStyle}>
          Sensitive actions require 2FA
          <select defaultValue='enabled' style={inputStyle}>
            <option value='enabled'>Enabled</option>
            <option value='disabled'>Disabled</option>
          </select>
        </label>
      </div>
    </section>
  );
}

const fieldStyle = {
  display: 'grid',
  gap: '.4rem',
  color: lightModeTokens.textSecondary,
  fontSize: '.9rem',
};

const inputStyle = {
  border: `1px solid ${lightModeTokens.borderStrong}`,
  borderRadius: 8,
  padding: '.5rem .65rem',
  color: lightModeTokens.textPrimary,
};
