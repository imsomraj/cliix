'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  profileValidationConstants,
  sanitizeBio,
  sanitizeDisplayName,
  sanitizeUsername,
  validateBio,
  validateDisplayName,
  validateUsername,
} from '@/lib/validation/profile';

type ProfileResponse = {
  ok: boolean;
  error?: string;
  profile?: {
    username: string;
    display_name: string;
    bio: string | null;
    avatar: string | null;
  };
};

export default function DashboardSettingsPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const response = await fetch('/api/profile');
      const payload = (await response.json()) as ProfileResponse;

      if (!mounted) {
        return;
      }

      if (!response.ok || !payload.ok || !payload.profile) {
        setError(payload.error ?? 'Failed to load profile.');
        setLoadingProfile(false);
        return;
      }

      setUsername(payload.profile.username ?? '');
      setDisplayName(payload.profile.display_name ?? '');
      setBio(payload.profile.bio ?? '');
      setAvatar(payload.profile.avatar ?? '');
      setLoadingProfile(false);
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const normalized = sanitizeUsername(username);
    const validationError = validateUsername(normalized);

    if (!normalized || validationError) {
      setUsernameStatus('idle');
      setUsernameMessage(validationError);
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage(null);

    const timer = setTimeout(async () => {
      const response = await fetch('/api/profile/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: normalized }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        available?: boolean;
        reason?: string | null;
      };

      if (!response.ok || !payload.ok) {
        setUsernameStatus('idle');
        setUsernameMessage('Could not validate username right now.');
        return;
      }

      setUsernameStatus(payload.available ? 'available' : 'taken');
      setUsernameMessage(payload.reason ?? (payload.available ? 'Username is available.' : 'Username is already taken.'));
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const formError = useMemo(() => {
    const normalizedUsername = sanitizeUsername(username);
    const normalizedDisplayName = sanitizeDisplayName(displayName);
    const normalizedBio = sanitizeBio(bio);

    return (
      validateUsername(normalizedUsername) ||
      validateDisplayName(normalizedDisplayName) ||
      validateBio(normalizedBio) ||
      (usernameStatus === 'taken' ? 'Username is already taken.' : null)
    );
  }, [bio, displayName, username, usernameStatus]);

  async function onAvatarSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setMessage(null);
    setUploadingAvatar(true);

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });

    const payload = (await response.json()) as { ok: boolean; error?: string; avatar?: string };

    setUploadingAvatar(false);

    if (!response.ok || !payload.ok || !payload.avatar) {
      setError(payload.error ?? 'Failed to upload avatar.');
      return;
    }

    setAvatar(payload.avatar);
    setMessage('Avatar updated.');
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const blockingError = formError;
    if (blockingError) {
      setError(blockingError);
      return;
    }

    setPending(true);

    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: sanitizeUsername(username),
        display_name: sanitizeDisplayName(displayName),
        bio: sanitizeBio(bio),
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
        <p className="text-sm text-zinc-600">Update your public profile and avatar.</p>
      </header>

      {loadingProfile ? <p className="text-sm text-zinc-500">Loading profile...</p> : null}

      <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border p-4">
        <label className="grid gap-1 text-sm">
          <span>Username</span>
          <input
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded border px-3 py-2"
            maxLength={32}
          />
          {usernameStatus === 'checking' ? <span className="text-xs text-zinc-500">Checking availability...</span> : null}
          {usernameMessage ? (
            <span className={`text-xs ${usernameStatus === 'taken' ? 'text-red-600' : 'text-zinc-600'}`}>{usernameMessage}</span>
          ) : null}
        </label>

        <label className="grid gap-1 text-sm">
          <span>Display name</span>
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="rounded border px-3 py-2"
            maxLength={profileValidationConstants.DISPLAY_NAME_MAX_LENGTH}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Bio</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            className="rounded border px-3 py-2"
            rows={4}
            maxLength={profileValidationConstants.BIO_MAX_LENGTH}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Avatar upload</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatarSelected} className="rounded border px-3 py-2" />
          {avatar ? <img src={avatar} alt="Avatar preview" className="mt-2 h-16 w-16 rounded-full object-cover" /> : null}
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}

        <button
          disabled={pending || uploadingAvatar || loadingProfile}
          className="w-fit rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {pending ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </main>
  );
}
