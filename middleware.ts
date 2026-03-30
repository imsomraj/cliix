import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  AUTH_HEADER_KEY,
  REFRESH_TOKEN_COOKIE,
  assertSupabaseConfig,
} from '@/lib/supabase/constants';

type RefreshResult = {
  access_token: string;
  refresh_token: string;
};

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

async function verifyAccessToken(accessToken: string): Promise<boolean> {
  const { url, anonKey } = assertSupabaseConfig();

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      [AUTH_HEADER_KEY]: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.ok;
}

async function refreshTokens(refreshToken: string): Promise<RefreshResult | null> {
  const { url, anonKey } = assertSupabaseConfig();

  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      [AUTH_HEADER_KEY]: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as RefreshResult;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return redirectToLogin(request);
  }

  if (accessToken && (await verifyAccessToken(accessToken))) {
    return NextResponse.next();
  }

  if (!refreshToken) {
    return redirectToLogin(request);
  }

  const refreshed = await refreshTokens(refreshToken);

  if (!refreshed?.access_token || !refreshed.refresh_token) {
    return redirectToLogin(request);
  }

  accessToken = refreshed.access_token;

  const response = NextResponse.next();

  response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
