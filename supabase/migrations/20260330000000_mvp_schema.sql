-- Extensions
create extension if not exists pgcrypto;

-- Generic timestamp trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Helper for admin role checks (scaffold for moderation/settings)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 32),
  display_name text,
  bio text,
  avatar_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- themes
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  css_vars jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger themes_set_updated_at
before update on public.themes
for each row execute procedure public.set_updated_at();

-- user theme preferences
create table if not exists public.user_theme_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  theme_id uuid not null references public.themes(id) on delete restrict,
  custom_css jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id)
);

create trigger user_theme_settings_set_updated_at
before update on public.user_theme_settings
for each row execute procedure public.set_updated_at();

-- links
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists links_profile_id_idx on public.links(profile_id);
create trigger links_set_updated_at
before update on public.links
for each row execute procedure public.set_updated_at();

-- social links
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  url text not null,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists social_links_profile_id_idx on public.social_links(profile_id);
create trigger social_links_set_updated_at
before update on public.social_links
for each row execute procedure public.set_updated_at();

-- analytics events
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  link_id uuid references public.links(id) on delete set null,
  event_type text not null,
  visitor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists analytics_events_profile_id_idx on public.analytics_events(profile_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.themes enable row level security;
alter table public.user_theme_settings enable row level security;
alter table public.analytics_events enable row level security;
alter table public.social_links enable row level security;

-- profiles: users manage own + public can read published profiles by username
create policy "profiles_select_own_or_published"
on public.profiles
for select
using (
  auth.uid() = id
  or is_published = true
  or public.is_admin()
);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id or public.is_admin());

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "profiles_delete_own"
on public.profiles
for delete
using (auth.uid() = id or public.is_admin());

-- links: own write/read private, public read only published links for published profiles
create policy "links_select_own_or_published"
on public.links
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = links.profile_id
      and (
        p.id = auth.uid()
        or (p.is_published = true and links.is_published = true)
      )
  )
  or public.is_admin()
);

create policy "links_cud_own"
on public.links
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = links.profile_id
      and p.id = auth.uid()
  )
  or public.is_admin()
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = links.profile_id
      and p.id = auth.uid()
  )
  or public.is_admin()
);

-- social links: same model as links
create policy "social_links_select_own_or_published"
on public.social_links
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = social_links.profile_id
      and (
        p.id = auth.uid()
        or (p.is_published = true and social_links.is_published = true)
      )
  )
  or public.is_admin()
);

create policy "social_links_cud_own"
on public.social_links
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = social_links.profile_id
      and p.id = auth.uid()
  )
  or public.is_admin()
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = social_links.profile_id
      and p.id = auth.uid()
  )
  or public.is_admin()
);

-- themes: public read active themes, admin writes
create policy "themes_read_active"
on public.themes
for select
using (is_active = true or public.is_admin());

create policy "themes_admin_write"
on public.themes
for all
using (public.is_admin())
with check (public.is_admin());

-- user theme settings: users manage only own row
create policy "user_theme_settings_select_own"
on public.user_theme_settings
for select
using (user_id = auth.uid() or public.is_admin());

create policy "user_theme_settings_cud_own"
on public.user_theme_settings
for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- analytics events: owners/admin read; inserts allowed for anon/auth users only on published profiles
create policy "analytics_events_select_owner"
on public.analytics_events
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = analytics_events.profile_id
      and (p.id = auth.uid() or public.is_admin())
  )
);

create policy "analytics_events_insert_public"
on public.analytics_events
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = analytics_events.profile_id
      and p.is_published = true
  )
  or public.is_admin()
);

create policy "analytics_events_admin_delete"
on public.analytics_events
for delete
using (public.is_admin());
