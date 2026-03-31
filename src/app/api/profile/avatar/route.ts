import { NextResponse } from 'next/server';

import { uploadProfileAvatar, upsertProfile, getProfileByUserId, restoreSupabaseSession } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export async function POST(request: Request) {
  const session = await restoreSupabaseSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Avatar file is required.' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ ok: false, error: 'Only PNG, JPG, and WEBP files are supported.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ ok: false, error: 'Avatar must be smaller than 2MB.' }, { status: 400 });
  }

  try {
    const current = await getProfileByUserId(session.user.id);

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Profile not found.' }, { status: 404 });
    }

    const upload = await uploadProfileAvatar({ userId: session.user.id, file });

    const profile = await upsertProfile({
      userId: session.user.id,
      username: current.username,
      display_name: current.display_name,
      bio: current.bio ?? '',
      avatar: upload.publicUrl,
    });

    return NextResponse.json({ ok: true, profile, avatar: upload.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to upload avatar.' },
      { status: 400 },
    );
  }
}
