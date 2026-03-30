import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_ROLE = 'admin';

function normalizeRole(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export async function getCurrentRole(): Promise<string> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const roleFromCookie = cookieStore.get('role')?.value;
  const roleFromHeader = headerStore.get('x-user-role');

  return normalizeRole(roleFromCookie ?? roleFromHeader);
}

export async function assertAdminAccess(): Promise<void> {
  const role = await getCurrentRole();

  if (role !== ADMIN_ROLE) {
    redirect('/');
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === ADMIN_ROLE;
}
