import { NextResponse } from 'next/server';

import { restoreSupabaseSession } from '@/lib/supabase/server';

export async function GET() {
  const restored = await restoreSupabaseSession();

  if (!restored) {
    return NextResponse.json({ ok: false, error: 'No active session.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: restored.user, refreshed: restored.refreshed });
}
