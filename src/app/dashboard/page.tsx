import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Signed in as {user.email}</p>
      <Link href="/logout">Log out</Link>
    </main>
  );
}
