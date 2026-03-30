import type { ReactNode } from 'react';

import { assertAdminAccess } from '../../lib/auth/guards';
import { lightModeTokens } from '../../lib/design/tokens';

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/themes', label: 'Themes' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await assertAdminAccess();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: lightModeTokens.background,
        color: lightModeTokens.textPrimary,
        padding: '2rem',
      }}
    >
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: lightModeTokens.surface,
          border: `1px solid ${lightModeTokens.border}`,
          borderRadius: 14,
          boxShadow: lightModeTokens.shadow,
        }}
      >
        <header
          style={{
            borderBottom: `1px solid ${lightModeTokens.border}`,
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Admin Console</h1>
          <nav style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  color: lightModeTokens.textSecondary,
                  background: lightModeTokens.surfaceMuted,
                  borderRadius: 999,
                  padding: '.4rem .7rem',
                  textDecoration: 'none',
                  border: `1px solid ${lightModeTokens.border}`,
                  fontSize: '.875rem',
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </section>
    </main>
  );
}
