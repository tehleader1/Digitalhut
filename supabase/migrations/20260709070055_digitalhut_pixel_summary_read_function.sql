create or replace function public.digitalhut_search_pixel_summary_read(p_location_limit integer default 16)
returns jsonb language sql stable as $$
with global_row as (
  select * from public.digitalhut_search_pixel_global_summary where id = true
), unique_row as (
  select count(*)::bigint as unique_visitors from public.digitalhut_search_pixel_unique_visitors
), last48 as (
  select event_name, sum(events_count)::bigint as count
  from public.digitalhut_search_pixel_hourly_rollups
  where bucket_hour >= date_trunc('hour', now() - interval '48 hours')
  group by event_name order by count desc, event_name asc limit 12
), pages as (
  select path as value, sum(page_views)::bigint as count
  from public.digitalhut_search_pixel_hourly_rollups where page_views > 0
  group by path order by count desc, value asc limit 8
), lane_rows as (
  select lane,sum(events_count)::bigint as events,sum(page_views)::bigint as page_views,
    sum(proof_route_opens)::bigint as proof_opens,sum(source_opens)::bigint as source_opens,
    sum(glb_preview_plays)::bigint as glb_plays,sum(podcast_interrupts)::bigint as podcast_interrupts,
    sum(searches)::bigint as searches,max(latest_event_at) as latest
  from public.digitalhut_search_pixel_hourly_rollups group by lane order by events desc,latest desc limit 12
), location_rollups as (
  select origin,path,lane,sum(events_count)::bigint as events,sum(page_views)::bigint as page_views,
    sum(second_actions)::bigint as second_actions,sum(glb_preview_plays)::bigint as glb_preview_plays,
    sum(podcast_interrupts)::bigint as podcast_interrupts,sum(autoplay_starts)::bigint as autoplay_starts,
    sum(searches)::bigint as searches,sum(market_opens)::bigint as market_opens,
    sum(proof_route_opens)::bigint as proof_route_opens,sum(source_opens)::bigint as source_opens,
    max(latest_event_at) as latest
  from public.digitalhut_search_pixel_hourly_rollups group by origin,path,lane
), location_visitors as (
  select origin,path,lane,count(distinct visitor_id)::bigint as visitors
  from public.digitalhut_search_pixel_hourly_visitors group by origin,path,lane
), locations as (
  select r.*,coalesce(v.visitors,0)::bigint as visitors,
    (r.proof_route_opens*80+r.source_opens*70+r.glb_preview_plays*28+r.podcast_interrupts*26+
     r.searches*22+r.autoplay_starts*24+r.market_opens*16+r.page_views*3+coalesce(v.visitors,0)*5)::bigint as public_signal_score
  from location_rollups r left join location_visitors v using (origin,path,lane)
  order by public_signal_score desc,r.events desc,r.path asc limit greatest(1,p_location_limit)
), second_locations as (
  select * from locations where second_actions > 0 order by public_signal_score desc,events desc limit 12
)
select jsonb_build_object(
  'global',coalesce((select to_jsonb(g) from global_row g),'{}'::jsonb),
  'uniqueVisitors',coalesce((select unique_visitors from unique_row),0),
  'last48Hours',coalesce((select jsonb_agg(jsonb_build_object('eventName',event_name,'count',count)) from last48),'[]'::jsonb),
  'topPages',coalesce((select jsonb_agg(jsonb_build_object('value',value,'count',count)) from pages),'[]'::jsonb),
  'topMasterKeywordLanes',coalesce((select jsonb_agg(jsonb_build_object('lane',lane,'events',events,'pageViews',page_views,'proofOpens',proof_opens,'sourceOpens',source_opens,'glbPlays',glb_plays,'podcastInterrupts',podcast_interrupts,'searches',searches,'latest',latest)) from lane_rows),'[]'::jsonb),
  'trafficLocationMap',coalesce((select jsonb_agg(jsonb_build_object('origin',origin,'path',path,'lane',lane,'events',events,'visitors',visitors,'pageViews',page_views,'secondActions',second_actions,'glbPreviewPlays',glb_preview_plays,'podcastInterrupts',podcast_interrupts,'autoplayStarts',autoplay_starts,'searches',searches,'marketOpens',market_opens,'proofRouteOpens',proof_route_opens,'sourceOpens',source_opens,'publicSignalScore',public_signal_score,'latest',latest,'sampleEvents','[]'::jsonb,'sampleQueries','[]'::jsonb,'sampleReferrers','[]'::jsonb)) from locations),'[]'::jsonb),
  'secondActionLocations',coalesce((select jsonb_agg(jsonb_build_object('origin',origin,'path',path,'lane',lane,'events',events,'visitors',visitors,'pageViews',page_views,'secondActions',second_actions,'glbPreviewPlays',glb_preview_plays,'podcastInterrupts',podcast_interrupts,'autoplayStarts',autoplay_starts,'searches',searches,'marketOpens',market_opens,'proofRouteOpens',proof_route_opens,'sourceOpens',source_opens,'publicSignalScore',public_signal_score,'latest',latest,'sampleEvents','[]'::jsonb,'sampleQueries','[]'::jsonb,'sampleReferrers','[]'::jsonb)) from second_locations),'[]'::jsonb)
)
$$;

revoke all on function public.digitalhut_search_pixel_summary_read(integer) from public, anon, authenticated;
grant execute on function public.digitalhut_search_pixel_summary_read(integer) to service_role;
