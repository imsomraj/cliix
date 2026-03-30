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

type SupabaseUserWithRoleClaims = {
  role?: string | null;
  app_metadata?: { role?: string | null } | null;
  user_metadata?: { role?: string | null } | null;
};

const ADMIN_ROLE = 'admin';

function normalizeRole(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function resolveRoleFromClaims(user: SupabaseUserWithRoleClaims | null | undefined): string {
  if (!user) {
    return '';
  }

  return normalizeRole(
    user.app_metadata?.role ??
      user.user_metadata?.role ??
      user.role,
  );
}

function redirectToLogin(request: NextRequest, includeRedirectPath = true) {
  const loginUrl = new URL('/login', request.url);
  if (includeRedirectPath) {
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
  }
  return NextResponse.redirect(loginUrl);
}

async function getUserFromAccessToken(accessToken: string): Promise<SupabaseUserWithRoleClaims | null> {
  const { url, anonKey } = assertSupabaseConfig();

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      [AUTH_HEADER_KEY]: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SupabaseUserWithRoleClaims;
}

function unauthorizedAdminResponse(request: NextRequest): NextResponse {
  const fallbackUrl = new URL('/dashboard', request.url);
  return NextResponse.redirect(fallbackUrl);
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
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isDashboardRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return redirectToLogin(request, !isAdminRoute);
  }

  if (accessToken) {
    const user = await getUserFromAccessToken(accessToken);
    if (user) {
      if (!isAdminRoute || resolveRoleFromClaims(user) === ADMIN_ROLE) {
        return NextResponse.next();
      }

      return unauthorizedAdminResponse(request);
    }
  }

  if (!refreshToken) {
    return redirectToLogin(request, !isAdminRoute);
  }

  const refreshed = await refreshTokens(refreshToken);

  if (!refreshed?.access_token || !refreshed.refresh_token) {
    return redirectToLogin(request, !isAdminRoute);
  }

  const user = await getUserFromAccessToken(refreshed.access_token);
  if (!user) {
    return redirectToLogin(request, !isAdminRoute);
  }

  if (isAdminRoute && resolveRoleFromClaims(user) !== ADMIN_ROLE) {
    const unauthorized = unauthorizedAdminResponse(request);
    unauthorized.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    unauthorized.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return unauthorized;
  }

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
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
