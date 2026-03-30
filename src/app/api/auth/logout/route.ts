import { NextResponse } from 'next/server';

import { clearAuthCookies } from '@/lib/supabase/server';

export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
