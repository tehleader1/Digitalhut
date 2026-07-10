-- Reconstructs the production search-pixel summary layer for branch previews.

create table if not exists public.digitalhut_search_pixel_global_summary (
  id boolean primary key default true check (id = true),
  total_events bigint not null default 0,
  page_views bigint not null default 0,
  blog_views bigint not null default 0,
  search_runs bigint not null default 0,
  proof_route_opens bigint not null default 0,
  source_opens bigint not null default 0,
  autoplay_starts bigint not null default 0,
  autoplay_pauses bigint not null default 0,
  episode_shifts bigint not null default 0,
  podcast_interrupts bigint not null default 0,
  glb_preview_plays bigint not null default 0,
  glb_replica_plays bigint not null default 0,
  timeline_scrubs bigint not null default 0,
  market_opens bigint not null default 0,
  intent_selections bigint not null default 0,
  wallet_clicks bigint not null default 0,
  tier_clicks bigint not null default 0,
  node_clicks bigint not null default 0,
  thumbnail_render_clicks bigint not null default 0,
  latest_event_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.digitalhut_search_pixel_unique_visitors (
  visitor_id text primary key,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  first_path text,
  last_path text,
  first_origin text,
  last_origin text,
  first_lane text,
  last_lane text
);

create table if not exists public.digitalhut_search_pixel_hourly_visitors (
  bucket_hour timestamptz not null,
  origin text not null,
  path text not null,
  lane text not null,
  visitor_id text not null,
  events_count bigint not null default 1,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  primary key (bucket_hour, origin, path, lane, visitor_id)
);

create table if not exists public.digitalhut_search_pixel_hourly_rollups (
  bucket_hour timestamptz not null,
  origin text not null,
  path text not null,
  lane text not null,
  event_name text not null,
  events_count bigint not null default 0,
  page_views bigint not null default 0,
  second_actions bigint not null default 0,
  glb_preview_plays bigint not null default 0,
  podcast_interrupts bigint not null default 0,
  autoplay_starts bigint not null default 0,
  searches bigint not null default 0,
  market_opens bigint not null default 0,
  proof_route_opens bigint not null default 0,
  source_opens bigint not null default 0,
  latest_event_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (bucket_hour, origin, path, lane, event_name)
);

create index if not exists digitalhut_search_pixel_hourly_rollups_lane_idx
  on public.digitalhut_search_pixel_hourly_rollups (lane, bucket_hour desc);
create index if not exists digitalhut_search_pixel_hourly_rollups_latest_idx
  on public.digitalhut_search_pixel_hourly_rollups (latest_event_at desc);
create index if not exists digitalhut_search_pixel_hourly_visitors_visitor_idx
  on public.digitalhut_search_pixel_hourly_visitors (visitor_id, bucket_hour desc);

alter table public.digitalhut_search_pixel_global_summary enable row level security;
alter table public.digitalhut_search_pixel_unique_visitors enable row level security;
alter table public.digitalhut_search_pixel_hourly_visitors enable row level security;
alter table public.digitalhut_search_pixel_hourly_rollups enable row level security;

create or replace function public.digitalhut_pixel_origin_bucket(p_referrer text)
returns text language sql immutable as $$
  select case
    when coalesce(p_referrer, '') = '' then 'direct-or-private-referrer'
    when lower(p_referrer) like '%vercel.%' or lower(p_referrer) like '%v0-nft-time-capsule-dapp%' then 'vercel-preview-or-deploy'
    when lower(p_referrer) like '%digitalhut.app%' then 'digitalhut-internal-navigation'
    when lower(p_referrer) like '%google.%' then 'google-search'
    when lower(p_referrer) like '%youtube.%' or lower(p_referrer) like '%youtu.be%' then 'youtube'
    when lower(p_referrer) like '%reddit.%' then 'reddit'
    when lower(p_referrer) like '%producthunt.%' then 'producthunt'
    else 'external-referrer'
  end
$$;

create or replace function public.digitalhut_pixel_lane(p_path text, p_category text, p_metadata jsonb)
returns text language sql stable as $$
  select coalesce(
    nullif(p_category, ''),
    nullif(p_metadata #>> '{masterKeyword,lane}', ''),
    nullif(p_metadata #>> '{seoClaim,lane}', ''),
    nullif(p_metadata #>> '{entryTrail,backlinkTrail,lane}', ''),
    case
      when coalesce(p_path, '') like '/blog/%' then replace(split_part(p_path, '/', 3), '-', ' ')
      when coalesce(p_path, '') like '/watch/%' then replace(split_part(p_path, '/', 3), '-', ' ')
      when coalesce(p_path, '') like '/category/%' then replace(split_part(p_path, '/', 3), '-', ' ')
      when coalesce(p_path, '') like '/markets%' then 'Market Observatory'
      else 'unassigned-lane'
    end
  )
$$;

create or replace function public.digitalhut_pixel_is_second_action(p_event_name text)
returns boolean language sql immutable as $$
  select p_event_name = any(array[
    'glb_preview_play','glb_preview_open','glb_replica_play','viral_glb_proof_play',
    'podcast_interrupt_play','podcast_interrupt_start','viral_podcast_source_start',
    'autoplay_start','episode_preview_autoplay_start','search_run','youtube_search_submit',
    'ticker_search','market_view_open','market_panel_open','proof_route_open','watch_route_open',
    'blog_route_open','category_proof_open','zone_checkpoint_open','viral_watch_route_open',
    'viral_source_route_open','backlink_source_open','glb_source_click','podcast_source_open',
    'viral_source_backlink_open'
  ])
$$;

create or replace function public.digitalhut_search_pixel_apply_rollup()
returns trigger language plpgsql as $$
declare
  v_bucket timestamptz := date_trunc('hour', new.created_at);
  v_origin text := public.digitalhut_pixel_origin_bucket(new.referrer);
  v_lane text := public.digitalhut_pixel_lane(new.path, new.category, new.metadata);
  v_path text := coalesce(nullif(new.path, ''), '/');
begin
  insert into public.digitalhut_search_pixel_global_summary as s (
    id,total_events,page_views,blog_views,search_runs,proof_route_opens,source_opens,
    autoplay_starts,autoplay_pauses,episode_shifts,podcast_interrupts,glb_preview_plays,
    glb_replica_plays,timeline_scrubs,market_opens,intent_selections,wallet_clicks,tier_clicks,
    node_clicks,thumbnail_render_clicks,latest_event_at,updated_at
  ) values (
    true,1,
    (new.event_name in ('page_view','blog_view'))::int,
    (new.event_name = 'blog_view')::int,
    (new.event_name in ('search_run','youtube_search_submit'))::int,
    (new.event_name in ('zone_checkpoint_open','proof_route_open','watch_route_open','blog_route_open','category_proof_open','viral_watch_route_open','viral_source_route_open'))::int,
    (new.event_name in ('backlink_source_open','glb_source_click','podcast_source_open','viral_source_backlink_open'))::int,
    (new.event_name in ('autoplay_start','episode_preview_autoplay_start'))::int,
    (new.event_name = 'autoplay_pause')::int,
    (new.event_name = 'autoplay_episode_shift')::int,
    (new.event_name in ('podcast_interrupt_play','podcast_interrupt_start','viral_podcast_source_start'))::int,
    (new.event_name in ('glb_preview_play','glb_preview_open'))::int,
    (new.event_name in ('glb_replica_play','viral_glb_proof_play'))::int,
    (new.event_name in ('timeline_scrub','platform_cadence_read'))::int,
    (new.event_name in ('market_view_open','market_panel_open','ticker_search'))::int,
    (new.event_name in ('search_intent_chip_select','quick_panel_select','category_lane_select'))::int,
    (new.event_name = 'wallet_connect_click')::int,
    (new.event_name = 'tier_click')::int,
    (new.event_name = 'node_click')::int,
    (new.event_name = 'thumbnail_render_click')::int,
    new.created_at,now()
  ) on conflict (id) do update set
    total_events=s.total_events+1,page_views=s.page_views+excluded.page_views,
    blog_views=s.blog_views+excluded.blog_views,search_runs=s.search_runs+excluded.search_runs,
    proof_route_opens=s.proof_route_opens+excluded.proof_route_opens,source_opens=s.source_opens+excluded.source_opens,
    autoplay_starts=s.autoplay_starts+excluded.autoplay_starts,autoplay_pauses=s.autoplay_pauses+excluded.autoplay_pauses,
    episode_shifts=s.episode_shifts+excluded.episode_shifts,podcast_interrupts=s.podcast_interrupts+excluded.podcast_interrupts,
    glb_preview_plays=s.glb_preview_plays+excluded.glb_preview_plays,glb_replica_plays=s.glb_replica_plays+excluded.glb_replica_plays,
    timeline_scrubs=s.timeline_scrubs+excluded.timeline_scrubs,market_opens=s.market_opens+excluded.market_opens,
    intent_selections=s.intent_selections+excluded.intent_selections,wallet_clicks=s.wallet_clicks+excluded.wallet_clicks,
    tier_clicks=s.tier_clicks+excluded.tier_clicks,node_clicks=s.node_clicks+excluded.node_clicks,
    thumbnail_render_clicks=s.thumbnail_render_clicks+excluded.thumbnail_render_clicks,
    latest_event_at=greatest(coalesce(s.latest_event_at,excluded.latest_event_at),excluded.latest_event_at),updated_at=now();

  if new.visitor_id is not null and new.visitor_id <> '' then
    insert into public.digitalhut_search_pixel_unique_visitors as v
      (visitor_id,first_seen_at,last_seen_at,first_path,last_path,first_origin,last_origin,first_lane,last_lane)
    values (new.visitor_id,new.created_at,new.created_at,v_path,v_path,v_origin,v_origin,v_lane,v_lane)
    on conflict (visitor_id) do update set last_seen_at=greatest(v.last_seen_at,excluded.last_seen_at),
      last_path=excluded.last_path,last_origin=excluded.last_origin,last_lane=excluded.last_lane;

    insert into public.digitalhut_search_pixel_hourly_visitors as hv
      (bucket_hour,origin,path,lane,visitor_id,events_count,first_seen_at,last_seen_at)
    values (v_bucket,v_origin,v_path,v_lane,new.visitor_id,1,new.created_at,new.created_at)
    on conflict (bucket_hour,origin,path,lane,visitor_id) do update set
      events_count=hv.events_count+1,last_seen_at=greatest(hv.last_seen_at,excluded.last_seen_at);
  end if;

  insert into public.digitalhut_search_pixel_hourly_rollups as r
    (bucket_hour,origin,path,lane,event_name,events_count,page_views,second_actions,glb_preview_plays,
     podcast_interrupts,autoplay_starts,searches,market_opens,proof_route_opens,source_opens,latest_event_at,updated_at)
  values (v_bucket,v_origin,v_path,v_lane,new.event_name,1,
    (new.event_name in ('page_view','blog_view'))::int,public.digitalhut_pixel_is_second_action(new.event_name)::int,
    (new.event_name in ('glb_preview_play','glb_preview_open'))::int,
    (new.event_name in ('podcast_interrupt_play','podcast_interrupt_start','viral_podcast_source_start'))::int,
    (new.event_name in ('autoplay_start','episode_preview_autoplay_start'))::int,
    (new.event_name in ('search_run','youtube_search_submit'))::int,
    (new.event_name in ('market_view_open','market_panel_open','ticker_search'))::int,
    (new.event_name in ('zone_checkpoint_open','proof_route_open','watch_route_open','blog_route_open','category_proof_open','viral_watch_route_open','viral_source_route_open'))::int,
    (new.event_name in ('backlink_source_open','glb_source_click','podcast_source_open','viral_source_backlink_open'))::int,
    new.created_at,now())
  on conflict (bucket_hour,origin,path,lane,event_name) do update set
    events_count=r.events_count+1,page_views=r.page_views+excluded.page_views,
    second_actions=r.second_actions+excluded.second_actions,glb_preview_plays=r.glb_preview_plays+excluded.glb_preview_plays,
    podcast_interrupts=r.podcast_interrupts+excluded.podcast_interrupts,autoplay_starts=r.autoplay_starts+excluded.autoplay_starts,
    searches=r.searches+excluded.searches,market_opens=r.market_opens+excluded.market_opens,
    proof_route_opens=r.proof_route_opens+excluded.proof_route_opens,source_opens=r.source_opens+excluded.source_opens,
    latest_event_at=greatest(coalesce(r.latest_event_at,excluded.latest_event_at),excluded.latest_event_at),updated_at=now();
  return new;
end
$$;

drop trigger if exists digitalhut_search_pixel_apply_rollup_trigger on public.digitalhut_search_pixel_events;
create trigger digitalhut_search_pixel_apply_rollup_trigger
after insert on public.digitalhut_search_pixel_events
for each row execute function public.digitalhut_search_pixel_apply_rollup();

