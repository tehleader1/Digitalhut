-- Read-only attribution of historical pixel events into SEO lanes.
-- Raw event totals remain unchanged; this is evidence classification only.

create or replace function public.digitalhut_search_pixel_master_list_legacy_read(p_location_limit integer default 24)
returns jsonb
language sql
stable
set search_path = public, pg_temp
as $$
with attributed as (
  select public.digitalhut_pixel_lane(path, category, metadata) as lane,
    event_name, created_at
  from public.digitalhut_search_pixel_events
), lane_rows as (
  select lane,
    count(*)::bigint as events,
    count(*) filter (where event_name in ('page_view','blog_view'))::bigint as page_views,
    count(*) filter (where public.digitalhut_pixel_is_second_action(event_name))::bigint as second_actions,
    count(*) filter (where event_name in ('glb_preview_play','glb_preview_open','glb_replica_play','viral_glb_proof_play'))::bigint as glb_plays,
    count(*) filter (where event_name in ('podcast_interrupt_play','podcast_interrupt_start','viral_podcast_source_start'))::bigint as podcast_interrupts,
    count(*) filter (where event_name in ('search_run','youtube_search_submit'))::bigint as searches,
    count(*) filter (where event_name in ('proof_route_open','watch_route_open','blog_route_open','category_proof_open','zone_checkpoint_open','viral_watch_route_open','viral_source_route_open'))::bigint as proof_opens,
    count(*) filter (where event_name in ('backlink_source_open','glb_source_click','podcast_source_open','viral_source_backlink_open'))::bigint as source_opens,
    max(created_at) as latest
  from attributed
  group by lane
  order by events desc, latest desc
  limit greatest(1, p_location_limit)
)
select jsonb_build_object(
  'ready', true,
  'source', 'raw-event-deterministic-attribution',
  'rawEventsPreserved', true,
  'lanes', coalesce((select jsonb_agg(jsonb_build_object(
    'lane', lane, 'events', events, 'pageViews', page_views, 'secondActions', second_actions,
    'glbPlays', glb_plays, 'podcastInterrupts', podcast_interrupts, 'searches', searches,
    'proofOpens', proof_opens, 'sourceOpens', source_opens, 'latest', latest
  )) from lane_rows), '[]'::jsonb)
)
$$;

revoke all on function public.digitalhut_search_pixel_master_list_legacy_read(integer) from public, anon, authenticated;
grant execute on function public.digitalhut_search_pixel_master_list_legacy_read(integer) to service_role;
