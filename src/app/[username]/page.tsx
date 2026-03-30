import { notFound } from 'next/navigation';

import { getSupabaseServerClient } from '@/lib/supabase/server';

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, is_published')
    .eq('username', username)
    .eq('is_published', true)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: links } = await supabase
    .from('links')
    .select('id, title, url, position, is_published')
    .eq('profile_id', profile.id)
    .eq('is_published', true)
    .order('position', { ascending: true });

  return (
    <main>
      <h1>{profile.display_name ?? profile.username}</h1>
      <p>{profile.bio}</p>
      <ul>
        {(links ?? []).map((link) => (
          <li key={link.id}>
            <a href={link.url} target="_blank" rel="noreferrer noopener">
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
