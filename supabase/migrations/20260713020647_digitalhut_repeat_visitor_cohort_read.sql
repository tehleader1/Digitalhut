-- Aggregate anonymous return behavior without exposing visitor identifiers.
-- This function is service-role only and uses invoker privileges.

create or replace function public.digitalhut_search_pixel_return_cohort_read()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
with visitor_rows as (
  select
    visitor_id,
    count(distinct session_id) filter (where nullif(btrim(session_id), '') is not null)::bigint as sessions,
    count(distinct (created_at at time zone 'UTC')::date)::bigint as active_days,
    count(*)::bigint as events,
    min(created_at) as first_seen,
    max(created_at) as latest_seen
  from public.digitalhut_search_pixel_events
  where nullif(btrim(visitor_id), '') is not null
  group by visitor_id
), totals as (
  select
    count(*)::bigint as observed_visitors,
    count(*) filter (where sessions >= 2)::bigint as repeat_session_visitors,
    count(*) filter (where active_days >= 2)::bigint as multi_day_visitors,
    coalesce(sum(events), 0)::bigint as observed_events,
    min(first_seen) as first_seen,
    max(latest_seen) as latest_seen
  from visitor_rows
)
select jsonb_build_object(
  'ready', true,
  'source', 'durable-all-history-rollup',
  'observedVisitors', coalesce(observed_visitors, 0),
  'repeatSessionVisitors', coalesce(repeat_session_visitors, 0),
  'multiDayVisitors', coalesce(multi_day_visitors, 0),
  'repeatSessionRatePercent', case when observed_visitors > 0 then round((repeat_session_visitors::numeric / observed_visitors::numeric) * 100, 1) else 0 end,
  'multiDayRatePercent', case when observed_visitors > 0 then round((multi_day_visitors::numeric / observed_visitors::numeric) * 100, 1) else 0 end,
  'observedEvents', coalesce(observed_events, 0),
  'firstSeen', first_seen,
  'latestSeen', latest_seen,
  'truthBoundary', 'Return behavior is aggregated from anonymous browser visitor IDs across the durable event history. It is not an account count and can reset with browser storage or privacy settings.'
)
from totals
$$;

revoke all on function public.digitalhut_search_pixel_return_cohort_read() from public, anon, authenticated;
grant execute on function public.digitalhut_search_pixel_return_cohort_read() to service_role;
