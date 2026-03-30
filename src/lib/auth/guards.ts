import { redirect } from 'next/navigation';

import { restoreSupabaseSession } from '@/lib/supabase/server';

const ADMIN_ROLE = 'admin';
const UNAUTHORIZED_REDIRECT_PATH = '/dashboard';

function normalizeRole(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

type SessionUserWithRoleClaims = {
  role?: string | null;
  app_metadata?: { role?: string | null } | null;
  user_metadata?: { role?: string | null } | null;
};

function resolveRoleFromClaims(user: SessionUserWithRoleClaims | null | undefined): string {
  if (!user) {
    return '';
  }

  return normalizeRole(
    user.app_metadata?.role ??
      user.user_metadata?.role ??
      user.role,
  );
}

export async function getCurrentRole(): Promise<string> {
  const session = await restoreSupabaseSession();

  if (!session?.user) {
    return '';
  }

  return resolveRoleFromClaims(session.user as SessionUserWithRoleClaims);
}

export async function assertAdminAccess(): Promise<void> {
  const role = await getCurrentRole();

  if (role !== ADMIN_ROLE) {
    redirect(UNAUTHORIZED_REDIRECT_PATH);
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === ADMIN_ROLE;
}
