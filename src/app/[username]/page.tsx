import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { PublicProfile } from "@/lib/public-profile";

type PageProps = {
  params: {
    username: string;
  };
};

const APP_NAME = "Cliix";
const DEFAULT_DESCRIPTION = "Explore profiles and creator links on Cliix.";
const DEFAULT_SOCIAL_IMAGE_PATH = "/images/default-social-card.jpg";

function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(
      `${baseUrl}/api/users/${encodeURIComponent(username)}/public`,
      {
        next: { revalidate: 300 },
      }
    );

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`profile fetch failed (${response.status})`);

    const payload = (await response.json()) as PublicProfile;
    return payload;
  } catch {
    return null;
  }
}

function buildProfileMetadata(
  username: string,
  profile: PublicProfile | null
): Metadata {
  const baseUrl = getBaseUrl();
  const canonicalPath = `/${encodeURIComponent(username)}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  const name = profile?.displayName?.trim() || `@${username}`;
  const title = `${name} | ${APP_NAME}`;

  const description =
    profile?.bio?.trim() ||
    `View ${name}'s links, latest content, and profile details on ${APP_NAME}.`;

  const socialImage =
    profile?.socialImageUrl || profile?.avatarUrl || `${baseUrl}${DEFAULT_SOCIAL_IMAGE_PATH}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonicalUrl,
      siteName: APP_NAME,
      images: [
        {
          url: socialImage,
          alt: `${name} profile preview image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const username = decodeURIComponent(params.username).trim();
  const safeUsername = username || "unknown";
  const profile = await getPublicProfile(safeUsername);

  return buildProfileMetadata(safeUsername, profile);
}

export default async function UserProfilePage({ params }: PageProps) {
  const username = decodeURIComponent(params.username).trim();
  const safeUsername = username || "unknown";
  const profile = await getPublicProfile(safeUsername);

  if (!profile) {
    notFound();
  }

  const heading = profile.displayName.trim() || `@${profile.username}`;
  const description = profile.bio?.trim() || DEFAULT_DESCRIPTION;
  const avatar = profile.avatarUrl || "/images/default-avatar.png";

  return (
    <main>
      <article>
        <header>
          <img src={avatar} alt={`${heading} avatar`} width={96} height={96} />
          <h1>{heading}</h1>
          <p>{description}</p>
        </header>

        <section aria-labelledby="profile-details">
          <h2 id="profile-details">Profile details</h2>
          <dl>
            <div>
              <dt>Username</dt>
              <dd>@{profile.username}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Active profile</dd>
            </div>
            <div>
              <dt>Theme</dt>
              <dd>{profile.theme.name}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="profile-links">
          <h2 id="profile-links">Links</h2>
          {profile.links.length === 0 ? (
            <p>No links available.</p>
          ) : (
            <ul>
              {profile.links.map((link) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="profile-socials">
          <h2 id="profile-socials">Socials</h2>
          {profile.socials.length === 0 ? (
            <p>No social profiles available.</p>
          ) : (
            <ul>
              {profile.socials.map((social) => (
                <li key={social.id}>
                  <a href={social.url} target="_blank" rel="noreferrer">
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </main>
  );
}
