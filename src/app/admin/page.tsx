import { lightModeTokens } from '../../lib/design/tokens';

const cards = [
  { label: 'Active users', value: '1,284' },
  { label: 'Published themes', value: '96' },
  { label: 'Open reports', value: '14' },
  { label: 'Policy checks', value: '99.2%' },
];

export default function AdminHomePage() {
  return (
    <section>
      <h2 style={{ marginTop: 0, marginBottom: '.5rem' }}>Overview</h2>
      <p style={{ marginTop: 0, color: lightModeTokens.textSecondary }}>
        Light-mode-first operations dashboard with role-protected admin routes.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '1rem',
        }}
      >
        {cards.map((card) => (
          <article
            key={card.label}
            style={{
              border: `1px solid ${lightModeTokens.border}`,
              borderRadius: 12,
              background: lightModeTokens.surfaceMuted,
              padding: '1rem',
            }}
          >
            <p style={{ margin: 0, color: lightModeTokens.textSecondary }}>{card.label}</p>
            <strong style={{ fontSize: '1.5rem' }}>{card.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
