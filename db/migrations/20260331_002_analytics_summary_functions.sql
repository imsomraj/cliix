begin;

create or replace function public.analytics_summary_totals(p_user_id uuid default null)
returns table(total_views bigint, total_clicks bigint)
language sql
stable
security invoker
as $$
  select
    count(*) filter (where event_type = 'pageview') as total_views,
    count(*) filter (where event_type = 'click') as total_clicks
  from public.analytics_events
  where p_user_id is null or user_id = p_user_id;
$$;

create or replace function public.analytics_summary_per_link(p_user_id uuid default null)
returns table(link_id uuid, clicks bigint)
language sql
stable
security invoker
as $$
  select
    e.link_id,
    count(*)::bigint as clicks
  from public.analytics_events e
  where
    e.event_type = 'click'
    and e.link_id is not null
    and (p_user_id is null or e.user_id = p_user_id)
  group by e.link_id
  order by clicks desc;
$$;

create or replace function public.analytics_summary_daily(p_user_id uuid default null)
returns table(date date, clicks bigint)
language sql
stable
security invoker
as $$
  select
    timezone('utc', e.occurred_at)::date as date,
    count(*)::bigint as clicks
  from public.analytics_events e
  where
    e.event_type = 'click'
    and (p_user_id is null or e.user_id = p_user_id)
  group by timezone('utc', e.occurred_at)::date
  order by date asc;
$$;

grant execute on function public.analytics_summary_totals(uuid) to anon, authenticated;
grant execute on function public.analytics_summary_per_link(uuid) to anon, authenticated;
grant execute on function public.analytics_summary_daily(uuid) to anon, authenticated;

commit;
