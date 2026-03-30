import { NextResponse } from 'next/server';

import { setAuthCookies, signUpWithPassword } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return NextResponse.json({ ok: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const session = await signUpWithPassword(body.email, body.password);

    if (session.access_token && session.refresh_token) {
      await setAuthCookies(session);
    }

    return NextResponse.json({ ok: true, user: session.user });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Signup failed.' },
      { status: 400 },
    );
  }
}
