import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type UserVisibility = 'active' | 'hidden' | 'suspended';

type PublicProfile = {
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  visibility: UserVisibility;
};

type ActiveLink = {
  id: string;
  label: string;
  href: string;
  order: number;
};

type ActiveSocialLink = {
  id: string;
  platform: string;
  href: string;
  order: number;
};

type ThemeSelection = {
  id: string;
  name: string;
};

type UserConfig = Record<string, unknown>;

type UserPagePayload = {
  profile: PublicProfile;
  links: ActiveLink[];
  socials: ActiveSocialLink[];
  theme: ThemeSelection;
  config: UserConfig;
};

type RouteParams = {
  username: string;
};

const BASE_URL =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  'http://localhost:3000';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw response;
  }

  return (await response.json()) as T;
}

async function loadUserPageData(username: string): Promise<UserPagePayload> {
  const encoded = encodeURIComponent(username);

  const [profile, links, socials, appearance] = await Promise.all([
    fetchJson<PublicProfile>(`/api/public/profile/${encoded}`),
    fetchJson<ActiveLink[]>(`/api/public/profile/${encoded}/links?status=active`),
    fetchJson<ActiveSocialLink[]>(`/api/public/profile/${encoded}/socials?status=active`),
    fetchJson<{ theme: ThemeSelection; config: UserConfig }>(
      `/api/public/profile/${encoded}/appearance`,
    ),
  ]);

  return {
    profile,
    links: [...links].sort((a, b) => a.order - b.order),
    socials: [...socials].sort((a, b) => a.order - b.order),
    theme: appearance.theme,
    config: appearance.config,
  };
}

function SafeFallbackPage({ username }: { username: string }) {
  return (
    <main>
      <header>
        <h1>Profile unavailable</h1>
      </header>
      <section aria-label="Account availability">
        <p>
          The profile for <strong>@{username}</strong> is not currently available.
        </p>
      </section>
      <footer>
        <small>Please check back later.</small>
      </footer>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { username } = await params;

  try {
    const data = await loadUserPageData(username);

    if (data.profile.visibility !== 'active') {
      return {
        title: `@${username} | Profile unavailable`,
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    return {
      title: `${data.profile.displayName} (@${data.profile.username})`,
      description: data.profile.bio ?? `View ${data.profile.displayName}'s links and social profiles.`,
      alternates: {
        canonical: `/${data.profile.username}`,
      },
    };
  } catch (error) {
    if (error instanceof Response && error.status === 404) {
      return {
        title: 'Profile not found',
      };
    }

    return {
      title: `@${username}`,
    };
  }
}

export default async function UserPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { username } = await params;

  let data: UserPagePayload;

  try {
    data = await loadUserPageData(username);
  } catch (error) {
    if (error instanceof Response && error.status === 404) {
      notFound();
    }

    throw error;
  }

  if (data.profile.visibility !== 'active') {
    return <SafeFallbackPage username={username} />;
  }

  return (
    <main data-theme-id={data.theme.id}>
      <header>
        <figure>
          {data.profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.profile.avatarUrl} alt={`${data.profile.displayName} avatar`} />
          ) : null}
          <figcaption>
            <h1>{data.profile.displayName}</h1>
            <p>@{data.profile.username}</p>
          </figcaption>
        </figure>
        {data.profile.bio ? <p>{data.profile.bio}</p> : null}
        {data.profile.location ? <p>{data.profile.location}</p> : null}
      </header>

      <section aria-labelledby="links-title">
        <h2 id="links-title">Links</h2>
        <ul>
          {data.links.map((link) => (
            <li key={link.id}>
              <a href={link.href} rel="noopener noreferrer" target="_blank">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="social-title">
        <h2 id="social-title">Social</h2>
        <ul>
          {data.socials.map((social) => (
            <li key={social.id}>
              <a href={social.href} rel="me noopener noreferrer" target="_blank">
                {social.platform}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer>
        <small>Theme: {data.theme.name}</small>
        <script
          id="user-config"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfilePage',
              mainEntity: {
                '@type': 'Person',
                name: data.profile.displayName,
                alternateName: data.profile.username,
                description: data.profile.bio ?? undefined,
                url: `/${data.profile.username}`,
                sameAs: data.socials.map((social) => social.href),
              },
              additionalProperty: {
                '@type': 'PropertyValue',
                name: 'userConfig',
                value: data.config,
              },
            }),
          }}
        />
      </footer>
    </main>
  );
}
