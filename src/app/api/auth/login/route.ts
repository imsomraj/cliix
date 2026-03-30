import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return NextResponse.redirect(new URL('/login?error=missing_fields', request.url));
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(new URL('/login?error=invalid_credentials', request.url));
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
