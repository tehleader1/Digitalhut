-- Exhaustive event-row taxonomy. These classes describe emission origin, not human identity.

alter table public.digitalhut_search_pixel_global_summary
  add column if not exists explicit_human_events bigint not null default 0,
  add column if not exists system_automatic_events bigint not null default 0,
  add column if not exists navigation_events bigint not null default 0,
  add column if not exists commerce_intent_events bigint not null default 0,
  add column if not exists server_verified_events bigint not null default 0,
  add column if not exists other_recorded_events bigint not null default 0;

create or replace function public.digitalhut_recorded_event_class(p_event_name text, p_metadata jsonb)
returns text language sql immutable as $$
  select case
    when coalesce(p_event_name, '') ~* '_verified$' or coalesce(p_metadata->>'paymentState', '') = 'server-verified' then 'serverVerified'
    when coalesce(p_event_name, '') = any(array['subscription_preview_open','subscription_checkout_intent','full_session_conversion_candidate','full_session_conversion_client_confirmed']) then 'commerceIntent'
    when coalesce(p_metadata->>'eventOrigin', '') = 'system-automatic'
      or lower(coalesce(p_metadata->>'control', p_metadata->>'reason', '')) = 'market-rotation'
      or coalesce(p_event_name, '') = any(array['algorithm_exposure','headline_search_dispatch','vertex_search_run','market_rotation_tick','experience_library_ready']) then 'systemAutomatic'
    when coalesce(p_metadata->>'eventOrigin', '') in ('navigation-arrival','route-arrival')
      or coalesce(p_event_name, '') = any(array['page_view','blog_view'])
      or coalesce(p_event_name, '') like '%\_arrival' escape '\' then 'navigation'
    when coalesce(p_metadata->>'eventOrigin', '') in ('deliberate-click','explicit-input','explicit-handler')
      or coalesce(p_event_name, '') = any(array[
        'ui_click','search_run','search_video_select','search_intent_chip_select','quick_panel_select','category_lane_select',
        'proof_route_open','watch_route_open','blog_route_open','category_proof_open','zone_checkpoint_open',
        'backlink_source_open','glb_source_click','podcast_source_open','source_bridge_open','source_bridge_live_return',
        'glb_preview_play','glb_preview_open','glb_replica_play','podcast_interrupt_start','podcast_interrupt_play',
        'autoplay_start','autoplay_pause','ticker_search','market_panel_open','wallet_connect_click','tier_click','node_click',
        'thumbnail_render_click','download_click','share_click','library_experience_open','library_share_intent','experience_resume_open'
      ]) then 'explicitHuman'
    else 'otherRecordedEvents'
  end
$$;

create or replace function public.digitalhut_apply_recorded_event_taxonomy()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare class_name text := public.digitalhut_recorded_event_class(new.event_name, coalesce(new.metadata, '{}'::jsonb));
begin
  insert into public.digitalhut_search_pixel_global_summary (id) values (true) on conflict (id) do nothing;
  update public.digitalhut_search_pixel_global_summary set
    explicit_human_events = explicit_human_events + (class_name = 'explicitHuman')::int,
    system_automatic_events = system_automatic_events + (class_name = 'systemAutomatic')::int,
    navigation_events = navigation_events + (class_name = 'navigation')::int,
    commerce_intent_events = commerce_intent_events + (class_name = 'commerceIntent')::int,
    server_verified_events = server_verified_events + (class_name = 'serverVerified')::int,
    other_recorded_events = other_recorded_events + (class_name = 'otherRecordedEvents')::int,
    updated_at = now()
  where id = true;
  return new;
end
$$;

drop trigger if exists digitalhut_recorded_event_taxonomy_trigger on public.digitalhut_search_pixel_events;
create trigger digitalhut_recorded_event_taxonomy_trigger
after insert on public.digitalhut_search_pixel_events
for each row execute function public.digitalhut_apply_recorded_event_taxonomy();

-- Seed and serialize the singleton summary during the exact recount. Inserts
-- can continue reaching the event table, but their taxonomy trigger waits on
-- this short lock and increments the committed baseline afterward.
insert into public.digitalhut_search_pixel_global_summary (id)
values (true)
on conflict (id) do nothing;

lock table public.digitalhut_search_pixel_global_summary in share row exclusive mode;

with classified as (
  select public.digitalhut_recorded_event_class(event_name, metadata) as class_name, count(*)::bigint as count
  from public.digitalhut_search_pixel_events group by 1
)
update public.digitalhut_search_pixel_global_summary set
  explicit_human_events = coalesce((select count from classified where class_name = 'explicitHuman'), 0),
  system_automatic_events = coalesce((select count from classified where class_name = 'systemAutomatic'), 0),
  navigation_events = coalesce((select count from classified where class_name = 'navigation'), 0),
  commerce_intent_events = coalesce((select count from classified where class_name = 'commerceIntent'), 0),
  server_verified_events = coalesce((select count from classified where class_name = 'serverVerified'), 0),
  other_recorded_events = coalesce((select count from classified where class_name = 'otherRecordedEvents'), 0),
  updated_at = now()
where id = true;

revoke all on function public.digitalhut_recorded_event_class(text, jsonb) from public, anon, authenticated;
revoke all on function public.digitalhut_apply_recorded_event_taxonomy() from public, anon, authenticated;
