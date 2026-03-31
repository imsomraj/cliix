import { NextResponse } from 'next/server';

import { getProfileByUserId, isUsernameTaken, restoreSupabaseSession, upsertProfile } from '@/lib/supabase/server';
import {
  sanitizeBio,
  sanitizeDisplayName,
  sanitizeUsername,
  validateBio,
  validateDisplayName,
  validateUsername,
} from '@/lib/validation/profile';

export async function GET() {
  const session = await restoreSupabaseSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const profile = await getProfileByUserId(session.user.id);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to load profile.' },
      { status: 400 },
    );
  }
}

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

  const username = sanitizeUsername(body.username ?? '');
  const displayName = sanitizeDisplayName(body.display_name ?? '');
  const bio = sanitizeBio(body.bio ?? '');
  const avatar = (body.avatar ?? '').trim();

  const usernameError = validateUsername(username);
  if (usernameError) {
    return NextResponse.json({ ok: false, error: usernameError }, { status: 400 });
  }

  const displayNameError = validateDisplayName(displayName);
  if (displayNameError) {
    return NextResponse.json({ ok: false, error: displayNameError }, { status: 400 });
  }

  const bioError = validateBio(bio);
  if (bioError) {
    return NextResponse.json({ ok: false, error: bioError }, { status: 400 });
  }

  try {
    const usernameTaken = await isUsernameTaken(username, session.user.id);

    if (usernameTaken) {
      return NextResponse.json({ ok: false, error: 'Username is already taken.' }, { status: 409 });
    }

    const profile = await upsertProfile({
      userId: session.user.id,
      username,
      display_name: displayName,
      bio,
      avatar,
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to update profile.' },
      { status: 400 },
    );
  }
}
