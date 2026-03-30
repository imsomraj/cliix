import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ADMIN_ROLE = 'admin';

function normalizeRole(value: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const roleFromCookie = request.cookies.get('role')?.value ?? null;
  const roleFromHeader = request.headers.get('x-user-role');
  const role = normalizeRole(roleFromCookie ?? roleFromHeader);

  if (role === ADMIN_ROLE) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/', request.url);
  loginUrl.searchParams.set('unauthorized', 'admin');

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
