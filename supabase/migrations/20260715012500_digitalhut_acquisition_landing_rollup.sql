-- Durable acquisition evidence keyed by primary source bucket and first landing.
-- Source evidence comes from first-party URL/referrer metadata and is not a
-- provider-verified Google, Bing, YouTube, or human-identity claim.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.digitalhut_search_pixel_acquisition_rollups (
  source_bucket text not null check (source_bucket ~ '^[a-z0-9:-]+$'),
  landing_path text not null check (landing_path ~ '^/[A-Za-z0-9/_-]*$'),
  events bigint not null default 0 check (events >= 0),
  page_views bigint not null default 0 check (page_views >= 0),
  second_actions bigint not null default 0 check (second_actions >= 0),
  proof_opens bigint not null default 0 check (proof_opens >= 0),
  checkout_intents bigint not null default 0 check (checkout_intents >= 0),
  verified_conversions bigint not null default 0 check (verified_conversions >= 0),
  first_seen_at timestamptz not null,
  latest_event_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (source_bucket, landing_path)
);

create table if not exists public.digitalhut_search_pixel_acquisition_visitors (
  source_bucket text not null,
  landing_path text not null,
  visitor_hash text not null check (visitor_hash ~ '^[a-f0-9]{64}$'),
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  primary key (source_bucket, landing_path, visitor_hash),
  foreign key (source_bucket, landing_path)
    references public.digitalhut_search_pixel_acquisition_rollups (source_bucket, landing_path)
    on delete cascade
);

create table if not exists public.digitalhut_search_pixel_acquisition_sessions (
  session_hash text primary key check (session_hash ~ '^[a-f0-9]{64}$'),
  source_bucket text not null check (source_bucket ~ '^[a-z0-9:-]+$'),
  landing_path text not null check (landing_path ~ '^/[A-Za-z0-9/_-]*$'),
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null
);

alter table public.digitalhut_search_pixel_acquisition_rollups enable row level security;
alter table public.digitalhut_search_pixel_acquisition_visitors enable row level security;
alter table public.digitalhut_search_pixel_acquisition_sessions enable row level security;
revoke all on table public.digitalhut_search_pixel_acquisition_rollups from public, anon, authenticated;
revoke all on table public.digitalhut_search_pixel_acquisition_visitors from public, anon, authenticated;
revoke all on table public.digitalhut_search_pixel_acquisition_sessions from public, anon, authenticated;
grant select, insert, update, delete on table public.digitalhut_search_pixel_acquisition_rollups to service_role;
grant select, insert, update, delete on table public.digitalhut_search_pixel_acquisition_visitors to service_role;
grant select, insert, update, delete on table public.digitalhut_search_pixel_acquisition_sessions to service_role;

create or replace function public.digitalhut_acquisition_safe_path(p_path text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  with candidate as (
    select split_part(split_part(coalesce(nullif(p_path, ''), '/'), '#', 1), '?', 1) as value
  )
  select case
    when length(value) > 700
      or value !~ '^/[A-Za-z0-9/_-]*$'
      or value ~ '(^|/)\.\.?(/|$)'
      then '/'
    when value = '/' then '/'
    else coalesce(nullif(regexp_replace(value, '/+$', ''), ''), '/')
  end
  from candidate
$$;

create or replace function public.digitalhut_acquisition_source_bucket(
  p_referrer text,
  p_path text,
  p_metadata jsonb
)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  with evidence as (
    select
      lower(trim(coalesce(
        nullif(p_metadata #>> '{acquisition,source}', ''),
        nullif(p_metadata ->> 'conversionSource', ''),
        ''
      ))) as source,
      lower(trim(coalesce(p_metadata #>> '{acquisition,distribution}', ''))) as distribution,
      trim(trailing '.' from lower(trim(coalesce(
        nullif(p_metadata #>> '{acquisition,referrerHost}', ''),
        nullif(p_metadata ->> 'referrerHost', ''),
        substring(lower(coalesce(p_referrer, '')) from '^https?://([^/:?#]+)'),
        ''
      )))) as referrer_host,
      lower(coalesce(p_path, '')) as event_path,
      lower(coalesce(p_metadata #>> '{acquisition,googleClickId}', '')) in ('true', '1') as google_click,
      lower(coalesce(p_metadata #>> '{acquisition,microsoftClickId}', '')) in ('true', '1') as microsoft_click
  )
  select case
    when microsoft_click or event_path ~ '(^|[?&])msclkid=' then 'bing-campaign'
    when google_click or event_path ~ '(^|[?&])(gclid|gbraid|wbraid|dclid)=' then 'google-campaign'
    when source ~ '(^|[^a-z])(google|googleads|google-news)([^a-z]|$)' then 'google-campaign'
    when source ~ '(^|[^a-z])(bing|microsoft)([^a-z]|$)' then 'bing-campaign'
    when source ~ '(^|[^a-z])(youtube|youtu-be)([^a-z]|$)' then 'youtube-referral'
    when source ~ '(^|[^a-z])(digitalhut|library|proof|deep-link)([^a-z]|$)' then 'digitalhut-owned-campaign'
    when referrer_host ~ '(^|[.])digitalhut[.]app$' then 'digitalhut-internal-navigation'
    when referrer_host ~ '(^|[.])(vercel[.]app|vercel[.]com)$' then 'vercel-preview-or-test'
    when referrer_host ~ '(^|[.])google[.](com|[a-z]{2}|co[.][a-z]{2}|com[.][a-z]{2})$'
      or referrer_host ~ '(^|[.])googleusercontent[.]com$' then 'google-search-or-surface'
    when referrer_host ~ '(^|[.])bing[.]com$'
      or referrer_host ~ '(^|[.])search[.]msn[.]com$' then 'bing-search'
    when referrer_host ~ '(^|[.])youtube[.]com$'
      or referrer_host ~ '(^|[.])youtu[.]be$' then 'youtube-referral'
    when source <> '' and source not in ('direct', 'direct-or-private', 'none') then 'utm-other'
    when distribution in ('library-share', 'asset-share', 'pwa-install', 'system-proof', 'human-share', 'share')
      then 'distribution:' || distribution
    when distribution <> '' then 'distribution:other'
    when referrer_host <> '' then 'external-referrer'
    else 'direct-or-private-referrer'
  end
  from evidence
$$;

create or replace function public.digitalhut_acquisition_landing_path(p_path text, p_metadata jsonb)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select public.digitalhut_acquisition_safe_path(coalesce(
    nullif(p_metadata #>> '{acquisition,landingPath}', ''),
    nullif(p_metadata ->> 'landingPath', ''),
    p_path,
    '/'
  ))
$$;

create or replace function public.digitalhut_acquisition_is_live_verified(
  p_event_name text,
  p_source text,
  p_path text,
  p_tier_key text,
  p_metadata jsonb
)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when p_event_name = 'paypal_subscription_verified' then
      p_source = 'paypal-provider-status'
      and p_path = '/checkout/paypal'
      and p_tier_key in ('tier-standard', 'tier-premium', 'tier-pro')
      and lower(coalesce(p_metadata ->> 'environment', '')) in ('live', 'production')
      and upper(coalesce(p_metadata ->> 'status', '')) = 'ACTIVE'
      and coalesce(p_metadata ->> 'subscriptionId', '') ~ '^[A-Za-z0-9-]{8,160}$'
      and coalesce(p_metadata ->> 'planId', '') <> ''
      and p_metadata ->> 'receiptType' = 'paypal-subscription-verification'
    when p_event_name = 'google_pay_access_pass_verified' then
      p_source = 'google-pay-order'
      and p_path = '/checkout/google-pay'
      and p_tier_key = 'one-time-access-pass'
      and lower(coalesce(p_metadata ->> 'environment', '')) in ('live', 'production')
      and lower(coalesce(p_metadata ->> 'recurring', '')) = 'false'
      and coalesce(p_metadata ->> 'orderId', '') ~ '^[A-Za-z0-9-]{8,160}$'
      and coalesce(p_metadata ->> 'captureId', '') ~ '^[A-Za-z0-9-]{8,160}$'
      and upper(coalesce(p_metadata ->> 'currency', '')) = 'USD'
      and p_metadata ->> 'receiptType' = 'google-pay-access-pass-verification'
    else false
  end
$$;

create or replace function public.digitalhut_acquisition_is_second_action(p_event_name text, p_metadata jsonb)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select coalesce(p_metadata ->> 'eventOrigin', '') in ('deliberate-click', 'explicit-input', 'explicit-handler')
    and coalesce(p_event_name, '') = any(array[
      'glb_preview_play','glb_preview_open','glb_replica_play','viral_glb_proof_play',
      'podcast_interrupt_play','podcast_interrupt_start','viral_podcast_source_start',
      'autoplay_start','search_run','youtube_search_submit','search_video_select',
      'ticker_search','market_view_open','market_panel_open','proof_route_open','watch_route_open',
      'blog_route_open','category_proof_open','zone_checkpoint_open','viral_watch_route_open',
      'viral_source_route_open','backlink_source_open','glb_source_click','podcast_source_open',
      'viral_source_backlink_open'
    ])
$$;

create or replace function public.digitalhut_search_pixel_apply_acquisition_rollup()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_candidate_source text := public.digitalhut_acquisition_source_bucket(new.referrer, new.path, new.metadata);
  v_candidate_landing text := public.digitalhut_acquisition_landing_path(new.path, new.metadata);
  v_source text;
  v_landing text;
  v_session_key text;
  v_session_hash text;
  v_explicit_origin boolean := coalesce(new.metadata ->> 'eventOrigin', '') in ('deliberate-click', 'explicit-input', 'explicit-handler');
  v_live_verified boolean := public.digitalhut_acquisition_is_live_verified(new.event_name, new.source, new.path, new.tier_key, new.metadata);
begin
  v_session_key := case
    when coalesce(new.session_id, '') in ('', 'anonymous') then 'event:' || new.id::text
    else new.session_id
  end;
  v_session_hash := encode(extensions.digest(convert_to(v_session_key, 'UTF8'), 'sha256'), 'hex');

  insert into public.digitalhut_search_pixel_acquisition_sessions as s
    (session_hash, source_bucket, landing_path, first_seen_at, last_seen_at)
  values (v_session_hash, v_candidate_source, v_candidate_landing, new.created_at, new.created_at)
  on conflict (session_hash) do update set
    last_seen_at = greatest(s.last_seen_at, excluded.last_seen_at)
  returning source_bucket, landing_path into v_source, v_landing;

  insert into public.digitalhut_search_pixel_acquisition_rollups as r (
    source_bucket, landing_path, events, page_views, second_actions, proof_opens,
    checkout_intents, verified_conversions, first_seen_at, latest_event_at, updated_at
  ) values (
    v_source, v_landing, 1,
    (new.event_name in ('page_view','blog_view'))::int,
    public.digitalhut_acquisition_is_second_action(new.event_name, new.metadata)::int,
    (v_explicit_origin and new.event_name in ('zone_checkpoint_open','proof_route_open','watch_route_open','blog_route_open','category_proof_open','viral_watch_route_open','viral_source_route_open'))::int,
    (v_explicit_origin and new.event_name in ('subscription_checkout_intent','google_pay_checkout_intent'))::int,
    v_live_verified::int,
    new.created_at, new.created_at, now()
  ) on conflict (source_bucket, landing_path) do update set
    events = r.events + excluded.events,
    page_views = r.page_views + excluded.page_views,
    second_actions = r.second_actions + excluded.second_actions,
    proof_opens = r.proof_opens + excluded.proof_opens,
    checkout_intents = r.checkout_intents + excluded.checkout_intents,
    verified_conversions = r.verified_conversions + excluded.verified_conversions,
    first_seen_at = least(r.first_seen_at, excluded.first_seen_at),
    latest_event_at = greatest(r.latest_event_at, excluded.latest_event_at),
    updated_at = now();

  if new.event_name in ('page_view','blog_view') and coalesce(new.visitor_id, '') <> '' then
    insert into public.digitalhut_search_pixel_acquisition_visitors as v
      (source_bucket, landing_path, visitor_hash, first_seen_at, last_seen_at)
    values (
      v_source,
      v_landing,
      encode(extensions.digest(convert_to(new.visitor_id, 'UTF8'), 'sha256'), 'hex'),
      new.created_at,
      new.created_at
    )
    on conflict (source_bucket, landing_path, visitor_hash) do update set
      first_seen_at = least(v.first_seen_at, excluded.first_seen_at),
      last_seen_at = greatest(v.last_seen_at, excluded.last_seen_at);
  end if;
  return new;
end
$$;

-- Serialize the exact rebuild against inserts. The migration reconstructs
-- legacy first touch from the earliest recorded page/blog row per session;
-- sessions without a page receipt use their earliest recorded event.
lock table public.digitalhut_search_pixel_events in share row exclusive mode;
drop trigger if exists digitalhut_search_pixel_apply_acquisition_rollup_trigger on public.digitalhut_search_pixel_events;
truncate table public.digitalhut_search_pixel_acquisition_visitors, public.digitalhut_search_pixel_acquisition_sessions, public.digitalhut_search_pixel_acquisition_rollups;

with base as (
  select e.*,
    case when coalesce(e.session_id, '') in ('', 'anonymous') then 'event:' || e.id::text else e.session_id end as session_key
  from public.digitalhut_search_pixel_events e
), first_page as (
  select distinct on (session_key) session_key, referrer, path, metadata, created_at
  from base
  where event_name in ('page_view','blog_view')
  order by session_key, created_at, id
), first_any as (
  select distinct on (session_key) session_key, referrer, path, metadata, created_at
  from base
  order by session_key, created_at, id
), first_touch as (
  select * from first_page
  union all
  select a.* from first_any a where not exists (select 1 from first_page p where p.session_key = a.session_key)
)
insert into public.digitalhut_search_pixel_acquisition_sessions
  (session_hash, source_bucket, landing_path, first_seen_at, last_seen_at)
select
  encode(extensions.digest(convert_to(session_key, 'UTF8'), 'sha256'), 'hex'),
  public.digitalhut_acquisition_source_bucket(referrer, path, metadata),
  public.digitalhut_acquisition_landing_path(path, metadata),
  created_at,
  created_at
from first_touch;

with base as (
  select e.*,
    case when coalesce(e.session_id, '') in ('', 'anonymous') then 'event:' || e.id::text else e.session_id end as session_key
  from public.digitalhut_search_pixel_events e
), first_page as (
  select distinct on (session_key) session_key, referrer, path, metadata
  from base
  where event_name in ('page_view','blog_view')
  order by session_key, created_at, id
), first_any as (
  select distinct on (session_key) session_key, referrer, path, metadata
  from base
  order by session_key, created_at, id
), first_touch as (
  select * from first_page
  union all
  select a.* from first_any a where not exists (select 1 from first_page p where p.session_key = a.session_key)
), classified as (
  select b.*,
    public.digitalhut_acquisition_source_bucket(t.referrer, t.path, t.metadata) as source_bucket,
    public.digitalhut_acquisition_landing_path(t.path, t.metadata) as landing_path
  from base b join first_touch t using (session_key)
), aggregated as (
  select source_bucket, landing_path,
    count(*)::bigint as events,
    count(*) filter (where event_name in ('page_view','blog_view'))::bigint as page_views,
    count(*) filter (where public.digitalhut_acquisition_is_second_action(event_name, metadata))::bigint as second_actions,
    count(*) filter (
      where coalesce(metadata ->> 'eventOrigin', '') in ('deliberate-click', 'explicit-input', 'explicit-handler')
        and event_name in ('zone_checkpoint_open','proof_route_open','watch_route_open','blog_route_open','category_proof_open','viral_watch_route_open','viral_source_route_open')
    )::bigint as proof_opens,
    count(*) filter (
      where coalesce(metadata ->> 'eventOrigin', '') in ('deliberate-click', 'explicit-input', 'explicit-handler')
        and event_name in ('subscription_checkout_intent','google_pay_checkout_intent')
    )::bigint as checkout_intents,
    count(*) filter (
      where public.digitalhut_acquisition_is_live_verified(event_name, source, path, tier_key, metadata)
    )::bigint as verified_conversions,
    min(created_at) as first_seen_at,
    max(created_at) as latest_event_at
  from classified
  group by source_bucket, landing_path
)
insert into public.digitalhut_search_pixel_acquisition_rollups (
  source_bucket, landing_path, events, page_views, second_actions, proof_opens,
  checkout_intents, verified_conversions, first_seen_at, latest_event_at, updated_at
)
select source_bucket, landing_path, events, page_views, second_actions, proof_opens,
  checkout_intents, verified_conversions, first_seen_at, latest_event_at, now()
from aggregated;

with base as (
  select e.*,
    case when coalesce(e.session_id, '') in ('', 'anonymous') then 'event:' || e.id::text else e.session_id end as session_key
  from public.digitalhut_search_pixel_events e
), first_page as (
  select distinct on (session_key) session_key, referrer, path, metadata
  from base
  where event_name in ('page_view','blog_view')
  order by session_key, created_at, id
), page_visitors as (
  select
    public.digitalhut_acquisition_source_bucket(p.referrer, p.path, p.metadata) as source_bucket,
    public.digitalhut_acquisition_landing_path(p.path, p.metadata) as landing_path,
    encode(extensions.digest(convert_to(b.visitor_id, 'UTF8'), 'sha256'), 'hex') as visitor_hash,
    min(b.created_at) as first_seen_at,
    max(b.created_at) as last_seen_at
  from base b join first_page p using (session_key)
  where b.event_name in ('page_view','blog_view') and coalesce(b.visitor_id, '') <> ''
  group by 1, 2, 3
)
insert into public.digitalhut_search_pixel_acquisition_visitors
  (source_bucket, landing_path, visitor_hash, first_seen_at, last_seen_at)
select source_bucket, landing_path, visitor_hash, first_seen_at, last_seen_at
from page_visitors;

create trigger digitalhut_search_pixel_apply_acquisition_rollup_trigger
after insert on public.digitalhut_search_pixel_events
for each row execute function public.digitalhut_search_pixel_apply_acquisition_rollup();

create or replace function public.digitalhut_search_pixel_acquisition_read(p_limit integer default 24)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with global_summary as (
    select id, total_events, page_views
    from public.digitalhut_search_pixel_global_summary
    where id = true
  ), coverage as (
    select
      coalesce(sum(events), 0)::bigint as rollup_events,
      coalesce(sum(page_views), 0)::bigint as rollup_page_views,
      coalesce(sum(verified_conversions), 0)::bigint as live_verified_conversions,
      count(*)::bigint as row_count
    from public.digitalhut_search_pixel_acquisition_rollups
  ), visitor_total as (
    select count(*)::bigint as visitor_rows
    from public.digitalhut_search_pixel_acquisition_visitors
  ), session_total as (
    select count(*)::bigint as session_rows
    from public.digitalhut_search_pixel_acquisition_sessions
  ), ranked as (
    select r.source_bucket, r.landing_path, r.events, r.page_views,
      count(v.visitor_hash)::bigint as unique_visitors,
      r.second_actions, r.proof_opens, r.checkout_intents, r.verified_conversions,
      r.first_seen_at, r.latest_event_at
    from public.digitalhut_search_pixel_acquisition_rollups r
    left join public.digitalhut_search_pixel_acquisition_visitors v
      on v.source_bucket = r.source_bucket and v.landing_path = r.landing_path
    group by r.source_bucket, r.landing_path, r.events, r.page_views, r.second_actions,
      r.proof_opens, r.checkout_intents, r.verified_conversions, r.first_seen_at, r.latest_event_at
    order by r.verified_conversions desc, r.checkout_intents desc, r.proof_opens desc,
      r.second_actions desc, r.page_views desc, r.source_bucket, r.landing_path
    limit greatest(1, least(coalesce(p_limit, 24), 100))
  )
  select jsonb_build_object(
    'ready', g.id is not null
      and c.rollup_events = g.total_events
      and c.rollup_page_views = g.page_views,
    'sourceUnit', 'first-recorded-page-source-evidence',
    'sourceAttributionVerified', false,
    'visitorUnit', 'pseudonymous-browser-ids',
    'humanCountVerified', false,
    'visitorCountsAdditive', false,
    'liveVerifiedOnly', true,
    'knownAutomationSignaturesExcludedFromNewIngestion', true,
    'automationFullyExcluded', false,
    'historyScope', 'all-recorded-events-reconstructed-to-earliest-page-or-event-per-session',
    'coverage', jsonb_build_object(
      'rollupEvents', c.rollup_events,
      'durableEvents', coalesce(g.total_events, 0),
      'rollupPageViews', c.rollup_page_views,
      'durablePageViews', coalesce(g.page_views, 0),
      'rowCount', c.row_count,
      'visitorRows', v.visitor_rows,
      'sessionRows', s.session_rows,
      'liveVerifiedConversions', c.live_verified_conversions
    ),
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object(
        'source', source_bucket,
        'landingPath', landing_path,
        'events', events,
        'pageViews', page_views,
        'uniqueVisitors', unique_visitors,
        'secondActions', second_actions,
        'proofOpens', proof_opens,
        'checkoutIntents', checkout_intents,
        'verifiedConversions', verified_conversions,
        'firstSeenAt', first_seen_at,
        'latest', latest_event_at
      ) order by verified_conversions desc, checkout_intents desc, proof_opens desc,
        second_actions desc, page_views desc, source_bucket, landing_path)
      from ranked
    ), '[]'::jsonb),
    'truthBoundary', 'Sources are first-party URL and referrer evidence, not provider-verified platform traffic. Visitor rows are pseudonymous, overlap across source/landing rows, and do not prove people.'
  )
  from global_summary g cross join coverage c cross join visitor_total v cross join session_total s
$$;

revoke all on function public.digitalhut_acquisition_safe_path(text) from public, anon, authenticated;
revoke all on function public.digitalhut_acquisition_source_bucket(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.digitalhut_acquisition_landing_path(text, jsonb) from public, anon, authenticated;
revoke all on function public.digitalhut_acquisition_is_live_verified(text, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.digitalhut_acquisition_is_second_action(text, jsonb) from public, anon, authenticated;
revoke all on function public.digitalhut_search_pixel_apply_acquisition_rollup() from public, anon, authenticated;
revoke all on function public.digitalhut_search_pixel_acquisition_read(integer) from public, anon, authenticated;
grant execute on function public.digitalhut_search_pixel_acquisition_read(integer) to service_role;
