import { NextResponse } from 'next/server';

import { isUsernameTaken, restoreSupabaseSession } from '@/lib/supabase/server';
import { sanitizeUsername, validateUsername } from '@/lib/validation/profile';

type Body = {
  username?: string;
};

export async function POST(request: Request) {
  const session = await restoreSupabaseSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  const username = sanitizeUsername(body.username ?? '');
  const usernameError = validateUsername(username);

  if (usernameError) {
    return NextResponse.json({ ok: true, username, available: false, reason: usernameError });
  }

  try {
    const taken = await isUsernameTaken(username, session.user.id);

    return NextResponse.json({
      ok: true,
      username,
      available: !taken,
      reason: taken ? 'Username is already taken.' : null,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to check username.' },
      { status: 400 },
    );
  }
}
