import type { ReactNode } from 'react';

import { AuthStateSync } from '@/components/auth-state-sync';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthStateSync />
        {children}
      </body>
    </html>
  );
}
