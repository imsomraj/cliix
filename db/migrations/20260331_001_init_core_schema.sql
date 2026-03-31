begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (auth.jwt() ->> 'role') = 'admin',
    false
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  avatar text,
  social_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,32}$')
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  position integer not null default 0,
  is_enabled boolean not null default true,
  icon_url text,
  icon_source text not null default 'favicon',
  manual_icon_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint links_position_non_negative check (position >= 0),
  constraint links_icon_source_valid check (icon_source in ('manual', 'known-platform', 'favicon'))
);

create index if not exists links_user_position_idx on public.links(user_id, position);

create trigger trg_links_updated_at
before update on public.links
for each row
execute function public.set_updated_at();

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  url text not null,
  position integer not null default 0,
  is_enabled boolean not null default true,
  icon_url text,
  icon_source text not null default 'favicon',
  manual_icon_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint social_links_position_non_negative check (position >= 0),
  constraint social_links_icon_source_valid check (icon_source in ('manual', 'known-platform', 'favicon'))
);

create index if not exists social_links_user_position_idx on public.social_links(user_id, position);

create trigger trg_social_links_updated_at
before update on public.social_links
for each row
execute function public.set_updated_at();

create table if not exists public.themes (
  id text primary key,
  name text not null,
  config_json jsonb not null,
  is_base boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_themes_updated_at
before update on public.themes
for each row
execute function public.set_updated_at();

create table if not exists public.user_theme_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  theme_id text references public.themes(id) on delete set null,
  config_json jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists user_theme_settings_user_idx on public.user_theme_settings(user_id);

create trigger trg_user_theme_settings_updated_at
before update on public.user_theme_settings
for each row
execute function public.set_updated_at();

-- compatibility alias used by current app queries.
create or replace view public.user_theme_configs as
select
  id,
  user_id,
  theme_id,
  config_json,
  created_at,
  updated_at
from public.user_theme_settings;

create table if not exists public.analytics_events (
  id bigserial primary key,
  event_type text not null,
  user_id uuid references public.profiles(id) on delete set null,
  link_id uuid references public.links(id) on delete set null,
  page text,
  referrer text,
  user_agent text,
  platform text,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint analytics_events_type_valid check (event_type in ('click', 'pageview'))
);

create index if not exists analytics_events_type_occurred_idx on public.analytics_events(event_type, occurred_at desc);
create index if not exists analytics_events_link_idx on public.analytics_events(link_id);
create index if not exists analytics_events_user_idx on public.analytics_events(user_id);

-- compatibility views used by current app code.
create or replace view public.analytics_clicks as
select
  id,
  link_id,
  user_id,
  occurred_at,
  referrer,
  user_agent,
  platform
from public.analytics_events
where event_type = 'click';

create or replace view public.analytics_pageviews as
select
  id,
  page,
  user_id,
  occurred_at,
  referrer,
  user_agent,
  platform
from public.analytics_events
where event_type = 'pageview';

create or replace function public.analytics_clicks_insert()
returns trigger
language plpgsql
as $$
begin
  insert into public.analytics_events(event_type, link_id, user_id, occurred_at, referrer, user_agent, platform)
  values ('click', new.link_id, new.user_id, coalesce(new.occurred_at, timezone('utc', now())), new.referrer, new.user_agent, new.platform);
  return null;
end;
$$;

create or replace function public.analytics_pageviews_insert()
returns trigger
language plpgsql
as $$
begin
  insert into public.analytics_events(event_type, page, user_id, occurred_at, referrer, user_agent, platform)
  values ('pageview', new.page, new.user_id, coalesce(new.occurred_at, timezone('utc', now())), new.referrer, new.user_agent, new.platform);
  return null;
end;
$$;

drop trigger if exists tr_analytics_clicks_insert on public.analytics_clicks;
create trigger tr_analytics_clicks_insert
instead of insert on public.analytics_clicks
for each row
execute function public.analytics_clicks_insert();

drop trigger if exists tr_analytics_pageviews_insert on public.analytics_pageviews;
create trigger tr_analytics_pageviews_insert
instead of insert on public.analytics_pageviews
for each row
execute function public.analytics_pageviews_insert();

alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.social_links enable row level security;
alter table public.themes enable row level security;
alter table public.user_theme_settings enable row level security;
alter table public.analytics_events enable row level security;

-- owner-only mutations.
create policy profiles_owner_mutate on public.profiles
for all to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy links_owner_mutate on public.links
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy social_links_owner_mutate on public.social_links
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy user_theme_settings_owner_mutate on public.user_theme_settings
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy analytics_events_owner_mutate on public.analytics_events
for all to authenticated
using (user_id = auth.uid())
with check (user_id is null or user_id = auth.uid());

-- public read for published profile page fields.
create policy profiles_public_read_published on public.profiles
for select to anon, authenticated
using (is_published = true);

create policy links_public_read_published_profile on public.links
for select to anon, authenticated
using (
  is_enabled = true
  and exists (
    select 1 from public.profiles p
    where p.id = links.user_id and p.is_published = true
  )
);

create policy social_links_public_read_published_profile on public.social_links
for select to anon, authenticated
using (
  is_enabled = true
  and exists (
    select 1 from public.profiles p
    where p.id = social_links.user_id and p.is_published = true
  )
);

create policy themes_public_read on public.themes
for select to anon, authenticated
using (true);

create policy user_theme_settings_public_read_published_profile on public.user_theme_settings
for select to anon, authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = user_theme_settings.user_id and p.is_published = true
  )
);

-- admin-only management paths.
create policy profiles_admin_manage on public.profiles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy links_admin_manage on public.links
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy social_links_admin_manage on public.social_links
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy themes_admin_manage on public.themes
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy user_theme_settings_admin_manage on public.user_theme_settings
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy analytics_events_admin_manage on public.analytics_events
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

commit;
