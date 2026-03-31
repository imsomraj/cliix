import { cookies } from 'next/headers';

import {
  ACCESS_TOKEN_COOKIE,
  AUTH_HEADER_KEY,
  REFRESH_TOKEN_COOKIE,
  assertSupabaseConfig,
} from './constants';

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: 'bearer';
  user: {
    id: string;
    email?: string;
  };
};

type SupabaseUser = {
  id: string;
  email?: string;
};

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function authHeaders(accessToken?: string): HeadersInit {
  const { anonKey } = assertSupabaseConfig();

  return {
    [AUTH_HEADER_KEY]: anonKey,
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function asErrorMessage(response: Response, payload: unknown): string {
  if (typeof payload === 'object' && payload !== null && 'msg' in payload && typeof payload.msg === 'string') {
    return payload.msg;
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error_description' in payload &&
    typeof payload.error_description === 'string'
  ) {
    return payload.error_description;
  }

  if (typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  return `${response.status} ${response.statusText}`;
}

async function fetchSupabase(path: string, init: RequestInit): Promise<Response> {
  const { url } = assertSupabaseConfig();
  return fetch(`${url}${path}`, init);
}

export async function setAuthCookies(session: Pick<SupabaseSession, 'access_token' | 'refresh_token'>) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getSessionTokens() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
  };
}

export async function signUpWithPassword(email: string, password: string): Promise<SupabaseSession> {
  const response = await fetchSupabase('/auth/v1/signup', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(asErrorMessage(response, payload));
  }

  return payload as SupabaseSession;
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
  const response = await fetchSupabase('/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(asErrorMessage(response, payload));
  }

  return payload as SupabaseSession;
}

export async function refreshSession(refreshToken: string): Promise<SupabaseSession> {
  const response = await fetchSupabase('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(asErrorMessage(response, payload));
  }

  return payload as SupabaseSession;
}

export async function getUserFromAccessToken(accessToken: string): Promise<SupabaseUser> {
  const response = await fetchSupabase('/auth/v1/user', {
    headers: authHeaders(accessToken),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(asErrorMessage(response, payload));
  }

  return payload as SupabaseUser;
}

export async function restoreSupabaseSession(): Promise<{ user: SupabaseUser; refreshed: boolean } | null> {
  const tokens = await getSessionTokens();

  if (!tokens.accessToken && !tokens.refreshToken) {
    return null;
  }

  if (tokens.accessToken) {
    try {
      const user = await getUserFromAccessToken(tokens.accessToken);
      return { user, refreshed: false };
    } catch {
      // fallthrough to refresh token flow
    }
  }

  if (!tokens.refreshToken) {
    await clearAuthCookies();
    return null;
  }

  try {
    const refreshedSession = await refreshSession(tokens.refreshToken);
    await setAuthCookies(refreshedSession);

    return {
      user: refreshedSession.user,
      refreshed: true,
    };
  } catch {
    await clearAuthCookies();
    return null;
  }
}

export async function upsertProfile(input: {
  userId: string;
  username: string;
  display_name: string;
  bio: string;
  avatar: string;
}) {
  const tokens = await getSessionTokens();

  if (!tokens.accessToken) {
    throw new Error('Missing session. Please log in again.');
  }

  const response = await fetchSupabase('/rest/v1/profiles?on_conflict=id', {
    method: 'POST',
    headers: {
      ...authHeaders(tokens.accessToken),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([
      {
        id: input.userId,
        username: input.username,
        display_name: input.display_name,
        bio: input.bio,
        avatar: input.avatar,
      },
    ]),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(asErrorMessage(response, payload));
  }

  return Array.isArray(payload) ? payload[0] : payload;
}

export type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar: string | null;
};

export async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  const tokens = await getSessionTokens();

  if (!tokens.accessToken) {
    throw new Error('Missing session. Please log in again.');
  }

  const encodedUserId = encodeURIComponent(userId);
  const response = await fetchSupabase(
    `/rest/v1/profiles?id=eq.${encodedUserId}&select=id,username,display_name,bio,avatar&limit=1`,
    {
      headers: authHeaders(tokens.accessToken),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(asErrorMessage(response, payload));
  }

  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  return payload[0] as UserProfile;
}

export async function isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
  const tokens = await getSessionTokens();

  if (!tokens.accessToken) {
    throw new Error('Missing session. Please log in again.');
  }

  const encodedUsername = encodeURIComponent(username);
  const response = await fetchSupabase(
    `/rest/v1/profiles?username=eq.${encodedUsername}&select=id&limit=1`,
    {
      headers: authHeaders(tokens.accessToken),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(asErrorMessage(response, payload));
  }

  const profile = Array.isArray(payload) && payload.length > 0 ? (payload[0] as { id?: string }) : null;

  if (!profile?.id) {
    return false;
  }

  return profile.id !== excludeUserId;
}

export async function uploadProfileAvatar(input: { userId: string; file: File }): Promise<{ path: string; publicUrl: string }> {
  const tokens = await getSessionTokens();

  if (!tokens.accessToken) {
    throw new Error('Missing session. Please log in again.');
  }

  const { url } = assertSupabaseConfig();
  const extension = input.file.name.split('.').pop()?.toLowerCase() || 'bin';
  const path = `profiles/${input.userId}/avatar.${extension}`;
  const uploadUrl = `${url}/storage/v1/object/avatars/${path}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      [AUTH_HEADER_KEY]: assertSupabaseConfig().anonKey,
      Authorization: `Bearer ${tokens.accessToken}`,
      'x-upsert': 'true',
      'Content-Type': input.file.type || 'application/octet-stream',
    },
    body: await input.file.arrayBuffer(),
  });

  const uploadPayload = await uploadResponse.json().catch(() => ({}));

  if (!uploadResponse.ok) {
    throw new Error(asErrorMessage(uploadResponse, uploadPayload));
  }

  const publicUrl = `${url}/storage/v1/object/public/avatars/${path}`;
  return { path, publicUrl };
}
