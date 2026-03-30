export type AuthResponse = {
  ok: boolean;
  error?: string;
  user?: {
    id: string;
    email?: string;
  };
};

export async function postAuth(path: string, body: unknown): Promise<AuthResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as AuthResponse;

  if (!response.ok) {
    return {
      ok: false,
      error: payload.error ?? 'Request failed',
    };
  }

  return payload;
}

export async function restoreSession(): Promise<AuthResponse> {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    cache: 'no-store',
  });

  const payload = (await response.json()) as AuthResponse;

  if (!response.ok) {
    return {
      ok: false,
      error: payload.error ?? 'Unable to restore session',
    };
  }

  return payload;
}
