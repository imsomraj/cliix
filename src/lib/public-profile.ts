import { postgrestRequest } from "@/lib/data/postgrest";
import { BASE_THEMES } from "@/theme/baseThemes";
import { parseThemeConfig, type ThemeConfig } from "@/theme/schema";

export type PublicLink = {
  id: string;
  title: string;
  url: string;
};

export type PublicSocial = {
  id: string;
  platform: string;
  url: string;
};

export type PublicProfileSeo = {
  displayName: string;
  bio: string | null;
  socialImageUrl: string | null;
};

export type PublicProfile = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  socialImageUrl: string | null;
  links: PublicLink[];
  socials: PublicSocial[];
  theme: ThemeConfig;
  seo: PublicProfileSeo;
};

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar: string | null;
  social_image_url?: string | null;
  social_image?: string | null;
};

type LinkRow = {
  id: string;
  title: string;
  url: string;
};

type SocialRow = {
  id: string;
  platform: string;
  url: string;
};

type ThemeConfigRow = {
  theme_id: string | null;
  config_json: unknown | null;
  themes?: {
    name?: string | null;
    config_json?: unknown | null;
  } | null;
};

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeTheme(input: unknown): ThemeConfig {
  try {
    return parseThemeConfig(input);
  } catch {
    return BASE_THEMES[0];
  }
}

export async function getPublicProfileByUsername(username: string): Promise<PublicProfile | null> {
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) return null;

  const encodedUsername = encodeURIComponent(normalizedUsername);
  const profiles = await postgrestRequest<ProfileRow[]>({
    path: `/profiles?username=eq.${encodedUsername}&select=id,username,display_name,bio,avatar,social_image_url,social_image&limit=1`,
  });

  const profile = profiles[0];
  if (!profile) return null;

  const [links, socials, themeRows] = await Promise.all([
    postgrestRequest<LinkRow[]>({
      path: `/links?user_id=eq.${profile.id}&is_enabled=eq.true&select=id,title,url&order=position.asc`,
    }),
    postgrestRequest<SocialRow[]>({
      path: `/social_links?user_id=eq.${profile.id}&is_enabled=eq.true&select=id,platform,url&order=position.asc`,
    }),
    postgrestRequest<ThemeConfigRow[]>({
      path: `/user_theme_configs?user_id=eq.${profile.id}&select=theme_id,config_json,themes(name,config_json)&order=updated_at.desc&limit=1`,
    }).catch(() => []),
  ]);

  const selectedTheme = normalizeTheme(themeRows[0]?.config_json ?? themeRows[0]?.themes?.config_json ?? null);
  const displayName = normalizeText(profile.display_name) ?? `@${profile.username}`;
  const bio = normalizeText(profile.bio);
  const avatarUrl = normalizeText(profile.avatar);
  const socialImageUrl = normalizeText(profile.social_image_url) ?? normalizeText(profile.social_image) ?? avatarUrl;

  return {
    username: profile.username,
    displayName,
    bio,
    avatarUrl,
    socialImageUrl,
    links: links.map((link) => ({ id: link.id, title: link.title, url: link.url })),
    socials: socials.map((social) => ({ id: social.id, platform: social.platform, url: social.url })),
    theme: selectedTheme,
    seo: {
      displayName,
      bio,
      socialImageUrl,
    },
  };
}
