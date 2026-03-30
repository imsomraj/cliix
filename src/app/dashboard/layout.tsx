import type { ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { restoreSupabaseSession } from '@/lib/supabase/server';

const navItems = [
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/links', label: 'Links' },
  { href: '/dashboard/social', label: 'Social' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const restored = await restoreSupabaseSession();

  if (!restored) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <section className="mx-auto w-full max-w-5xl rounded-lg border bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-zinc-600">Signed in as {restored.user.email ?? restored.user.id}</p>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="rounded border px-3 py-1.5 text-sm">Logout</button>
          </form>
        </header>

        <nav className="flex flex-wrap gap-2 border-b px-5 py-3 text-sm">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="rounded border px-3 py-1.5 hover:bg-zinc-100">
              {item.label}
            </a>
          ))}
        </nav>

        <div>{children}</div>
      </section>
    </main>
  );
}
