import type { ThemeConfig } from "@/theme/schema";
import { BASE_THEMES } from "@/theme/baseThemes";

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

export type PublicProfile = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  socialImageUrl: string | null;
  links: PublicLink[];
  socials: PublicSocial[];
  theme: ThemeConfig;
};

const profileByUsername: Record<string, Omit<PublicProfile, "username">> = {
  alex: {
    displayName: "Alex Rivera",
    bio: "Designer and maker sharing experiments, resources, and weekly notes.",
    avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=256&q=80",
    socialImageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    links: [
      { id: "alex-1", title: "Portfolio", url: "https://example.com/alex/portfolio" },
      { id: "alex-2", title: "Newsletter", url: "https://example.com/alex/newsletter" },
      { id: "alex-3", title: "Now", url: "https://example.com/alex/now" },
    ],
    socials: [
      { id: "alex-s-1", platform: "X", url: "https://x.com/alex" },
      { id: "alex-s-2", platform: "LinkedIn", url: "https://linkedin.com/in/alex" },
      { id: "alex-s-3", platform: "GitHub", url: "https://github.com/alex" },
    ],
    theme: BASE_THEMES[0],
  },
  sam: {
    displayName: "Sam Patel",
    bio: "Indie developer building tiny SaaS tools in public.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    socialImageUrl: null,
    links: [
      { id: "sam-1", title: "Product Hunt", url: "https://example.com/sam/producthunt" },
      { id: "sam-2", title: "Docs", url: "https://example.com/sam/docs" },
    ],
    socials: [
      { id: "sam-s-1", platform: "YouTube", url: "https://youtube.com/@sam" },
      { id: "sam-s-2", platform: "Discord", url: "https://discord.gg/sam" },
    ],
    theme: BASE_THEMES[1],
  },
};

export function getPublicProfileByUsername(username: string): PublicProfile | null {
  const normalized = username.trim().toLowerCase();
  const profile = profileByUsername[normalized];

  if (!profile) return null;

  return {
    username: normalized,
    ...profile,
  };
}
