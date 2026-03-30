'use client';

import { useState } from 'react';

export default function DashboardSettingsPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setPending(true);

    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        display_name: displayName,
        bio,
        avatar,
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? 'Failed to update profile.');
      return;
    }

    setMessage('Profile updated.');
  }

  return (
    <main className="space-y-5 p-6">
      <header>
        <h2 className="text-xl font-semibold">Profile settings</h2>
        <p className="text-sm text-zinc-600">Update username, display name, bio, and avatar URL.</p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border p-4">
        <label className="grid gap-1 text-sm">
          <span>Username</span>
          <input
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Display name</span>
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Bio</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            className="rounded border px-3 py-2"
            rows={4}
            maxLength={180}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Avatar URL</span>
          <input
            type="url"
            value={avatar}
            onChange={(event) => setAvatar(event.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}

        <button disabled={pending} className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-60">
          {pending ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </main>
  );
}
