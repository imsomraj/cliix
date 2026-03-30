import { AUTH_HEADER_KEY, assertSupabaseConfig } from '@/lib/supabase/constants';

type PostgrestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type PostgrestRequest = {
  path: string;
  method?: PostgrestMethod;
  accessToken?: string;
  body?: unknown;
  headers?: HeadersInit;
};

function toErrorMessage(response: Response, payload: unknown) {
  if (typeof payload === 'object' && payload !== null) {
    const maybeMessage = (payload as Record<string, unknown>).message;
    const maybeError = (payload as Record<string, unknown>).error;

    if (typeof maybeMessage === 'string') {
      return maybeMessage;
    }

    if (typeof maybeError === 'string') {
      return maybeError;
    }
  }

  return `${response.status} ${response.statusText}`;
}

export async function postgrestRequest<T>({ path, method = 'GET', accessToken, body, headers }: PostgrestRequest): Promise<T> {
  const { url, anonKey } = assertSupabaseConfig();

  const response = await fetch(`${url}/rest/v1${path}`, {
    method,
    headers: {
      [AUTH_HEADER_KEY]: anonKey,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(toErrorMessage(response, payload));
  }

  return payload as T;
}

export async function postgrestRequestWithMeta<T>({
  path,
  method = 'GET',
  accessToken,
  body,
  headers,
}: PostgrestRequest): Promise<{ data: T; headers: Headers }> {
  const { url, anonKey } = assertSupabaseConfig();

  const response = await fetch(`${url}/rest/v1${path}`, {
    method,
    headers: {
      [AUTH_HEADER_KEY]: anonKey,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(toErrorMessage(response, payload));
  }

  return { data: payload as T, headers: response.headers };
}
