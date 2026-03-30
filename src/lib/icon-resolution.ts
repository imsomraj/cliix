const KNOWN_PLATFORM_ICONS: Record<string, string> = {
  x: '/icons/x.svg',
  twitter: '/icons/x.svg',
  github: '/icons/github.svg',
  linkedin: '/icons/linkedin.svg',
  instagram: '/icons/instagram.svg',
  youtube: '/icons/youtube.svg',
  facebook: '/icons/facebook.svg',
  tiktok: '/icons/tiktok.svg',
};

export type IconResolutionResult = {
  iconUrl: string;
  source: 'manual' | 'known-platform' | 'favicon';
};

export function resolveIconForUrl({
  url,
  manualIconUrl,
  platform,
}: {
  url: string;
  manualIconUrl?: string | null;
  platform?: string | null;
}): IconResolutionResult {
  if (manualIconUrl) {
    return { iconUrl: manualIconUrl, source: 'manual' };
  }

  const normalizedPlatform = platform?.trim().toLowerCase();
  if (normalizedPlatform && KNOWN_PLATFORM_ICONS[normalizedPlatform]) {
    return { iconUrl: KNOWN_PLATFORM_ICONS[normalizedPlatform], source: 'known-platform' };
  }

  try {
    const parsed = new URL(url);
    const segments = parsed.hostname.split('.').filter(Boolean);

    for (const segment of segments) {
      if (KNOWN_PLATFORM_ICONS[segment]) {
        return { iconUrl: KNOWN_PLATFORM_ICONS[segment], source: 'known-platform' };
      }
    }

    return {
      iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=128`,
      source: 'favicon',
    };
  } catch {
    return { iconUrl: '/icons/link.svg', source: 'favicon' };
  }
}
