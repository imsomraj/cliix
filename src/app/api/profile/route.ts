import { NextResponse } from 'next/server';

import { restoreSupabaseSession, upsertProfile } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  const session = await restoreSupabaseSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const body = (await request.json()) as {
    username?: string;
    display_name?: string;
    bio?: string;
    avatar?: string;
  };

  if (!body.username || !body.display_name) {
    return NextResponse.json({ ok: false, error: 'username and display_name are required.' }, { status: 400 });
  }

  try {
    const profile = await upsertProfile({
      userId: session.user.id,
      username: body.username.trim(),
      display_name: body.display_name.trim(),
      bio: (body.bio ?? '').trim(),
      avatar: (body.avatar ?? '').trim(),
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to update profile.' },
      { status: 400 },
    );
  }
}
