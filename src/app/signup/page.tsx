'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { postAuth } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await postAuth('/api/auth/signup', { email, password });

    setPending(false);

    if (!result.ok) {
      setError(result.error ?? 'Signup failed');
      return;
    }

    router.push('/dashboard/analytics');
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <p className="text-sm text-zinc-600">Use email/password auth via Supabase.</p>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border p-4">
        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded border px-3 py-2"
            minLength={8}
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button disabled={pending} className="rounded bg-black px-4 py-2 text-white disabled:opacity-60">
          {pending ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-zinc-600">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}
