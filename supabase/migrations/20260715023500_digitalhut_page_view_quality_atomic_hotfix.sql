-- Additive correction for the already-applied 022500 page-view quality layer.
-- Serializes first receipts on the guaranteed acquisition-session row and
-- separates all pinned sessions from sessions containing page receipts.

create or replace function public.digitalhut_search_pixel_apply_page_view_quality()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_session_key text;
  v_session_hash text;
  v_page_path text := public.digitalhut_acquisition_safe_path(new.path);
  v_source text;
  v_landing text;
  v_previous_path text;
  v_previous_count bigint;
  v_first bigint := 0;
  v_later bigint := 0;
  v_repeat bigint := 0;
begin
  if new.event_name not in ('page_view', 'blog_view') then return new; end if;
  v_session_key := case when coalesce(new.session_id, '') in ('', 'anonymous') then 'event:' || new.id::text else new.session_id end;
  v_session_hash := encode(extensions.digest(convert_to(v_session_key, 'UTF8'), 'sha256'), 'hex');

  -- This row is guaranteed by the alphabetically earlier acquisition trigger.
  -- FOR UPDATE serializes two first receipts before either tests absent state.
  select source_bucket, landing_path into v_source, v_landing
  from public.digitalhut_search_pixel_acquisition_sessions
  where session_hash = v_session_hash
  for update;
  if not found then raise exception 'page quality missing pinned acquisition session %', v_session_hash; end if;

  select last_page_path, page_view_count into v_previous_path, v_previous_count
  from public.digitalhut_search_pixel_page_session_state
  where session_hash = v_session_hash
  for update;
  if not found then
    v_first := 1;
    insert into public.digitalhut_search_pixel_page_session_state
      (session_hash, source_bucket, landing_path, last_page_path, page_view_count, first_page_at, last_page_at)
    values (v_session_hash, v_source, v_landing, v_page_path, 1, new.created_at, new.created_at);
  else
    if v_previous_path = v_page_path then v_repeat := 1; else v_later := 1; end if;
    update public.digitalhut_search_pixel_page_session_state set
      last_page_path = v_page_path,
      page_view_count = v_previous_count + 1,
      last_page_at = greatest(last_page_at, new.created_at)
    where session_hash = v_session_hash;
  end if;

  update public.digitalhut_search_pixel_acquisition_rollups set
    first_landing_views = first_landing_views + v_first,
    later_navigation_views = later_navigation_views + v_later,
    repeated_same_route_views = repeated_same_route_views + v_repeat,
    updated_at = now()
  where source_bucket = v_source and landing_path = v_landing;
  if not found then raise exception 'page quality missing acquisition rollup % %', v_source, v_landing; end if;
  return new;
end;
$$;

create or replace function public.digitalhut_search_pixel_acquisition_read(p_limit integer default 24)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  with g as (select id, total_events, page_views from public.digitalhut_search_pixel_global_summary where id = true),
  c as (select coalesce(sum(events),0)::bigint rollup_events, coalesce(sum(page_views),0)::bigint rollup_page_views,
    coalesce(sum(first_landing_views),0)::bigint first_landing_views, coalesce(sum(later_navigation_views),0)::bigint later_navigation_views,
    coalesce(sum(repeated_same_route_views),0)::bigint repeated_same_route_views, coalesce(sum(verified_conversions),0)::bigint live_verified_conversions,
    count(*)::bigint row_count from public.digitalhut_search_pixel_acquisition_rollups),
  rb as (select count(*)::bigint recorded_browser_ids from public.digitalhut_search_pixel_unique_visitors),
  vt as (select count(*)::bigint visitor_rows,
    count(distinct visitor_hash)::bigint page_bearing_browser_ids
    from public.digitalhut_search_pixel_acquisition_visitors),
  st as (select count(*)::bigint session_rows from public.digitalhut_search_pixel_acquisition_sessions),
  ps as (select count(*)::bigint page_sessions from public.digitalhut_search_pixel_page_session_state),
  ranked as (select r.*,
    (select count(*)::bigint from public.digitalhut_search_pixel_acquisition_visitors v where v.source_bucket=r.source_bucket and v.landing_path=r.landing_path) unique_visitors,
    (select count(*)::bigint from public.digitalhut_search_pixel_acquisition_sessions s where s.source_bucket=r.source_bucket and s.landing_path=r.landing_path) pinned_sessions,
    (select count(*)::bigint from public.digitalhut_search_pixel_page_session_state q where q.source_bucket=r.source_bucket and q.landing_path=r.landing_path) page_sessions
    from public.digitalhut_search_pixel_acquisition_rollups r
    order by r.verified_conversions desc, r.checkout_intents desc, r.proof_opens desc, r.second_actions desc, r.page_views desc, r.source_bucket, r.landing_path
    limit greatest(1, least(coalesce(p_limit,24),100)))
  select jsonb_build_object(
    'ready', g.id is not null and c.rollup_events=g.total_events and c.rollup_page_views=g.page_views
      and c.first_landing_views=ps.page_sessions
      and vt.page_bearing_browser_ids<=ps.page_sessions
      and c.first_landing_views+c.later_navigation_views+c.repeated_same_route_views=g.page_views,
    'sourceUnit','first-recorded-page-source-evidence','sourceAttributionVerified',false,
    'visitorUnit','pseudonymous-browser-ids','humanCountVerified',false,'visitorCountsAdditive',false,
    'recordedBrowserIdScope','any-accepted-event','pageBearingBrowserIdScope','at-least-one-recorded-page-event',
    'pageViewQualityUnit','recorded-page-event-rows-partitioned-within-pseudonymous-sessions',
    'pageViewQualityCountsPeople',false,'liveVerifiedOnly',true,
    'knownAutomationSignaturesExcludedFromNewIngestion',true,'automationFullyExcluded',false,
    'historyScope','all-recorded-events-reconstructed-to-earliest-page-or-event-per-session',
    'coverage',jsonb_build_object('rollupEvents',c.rollup_events,'durableEvents',coalesce(g.total_events,0),
      'rollupPageViews',c.rollup_page_views,'durablePageViews',coalesce(g.page_views,0),'firstLandingViews',c.first_landing_views,
      'laterNavigationViews',c.later_navigation_views,'repeatedSameRouteViews',c.repeated_same_route_views,
      'rowCount',c.row_count,'recordedBrowserIds',rb.recorded_browser_ids,
      'pageBearingBrowserIds',vt.page_bearing_browser_ids,'visitorRows',vt.visitor_rows,
      'sessionRows',st.session_rows,'pinnedSessions',st.session_rows,
      'pageSessions',ps.page_sessions,
      'viewsPerPinnedSession',case when st.session_rows>0 then round(c.rollup_page_views::numeric/st.session_rows,2) else 0 end,
      'viewsPerPageSession',case when ps.page_sessions>0 then round(c.rollup_page_views::numeric/ps.page_sessions,2) else 0 end,
      'liveVerifiedConversions',c.live_verified_conversions),
    'rows',coalesce((select jsonb_agg(jsonb_build_object('source',source_bucket,'landingPath',landing_path,'events',events,
      'pageViews',page_views,'uniqueVisitors',unique_visitors,'pinnedSessions',pinned_sessions,'pageSessions',page_sessions,
      'viewsPerPinnedSession',case when pinned_sessions>0 then round(page_views::numeric/pinned_sessions,2) else 0 end,
      'viewsPerPageSession',case when page_sessions>0 then round(page_views::numeric/page_sessions,2) else 0 end,
      'firstLandingViews',first_landing_views,'laterNavigationViews',later_navigation_views,'repeatedSameRouteViews',repeated_same_route_views,
      'secondActions',second_actions,'proofOpens',proof_opens,'checkoutIntents',checkout_intents,'verifiedConversions',verified_conversions,
      'firstSeenAt',first_seen_at,'latest',latest_event_at) order by verified_conversions desc,checkout_intents desc,proof_opens desc,second_actions desc,page_views desc,source_bucket,landing_path) from ranked),'[]'::jsonb),
    'truthBoundary','Recorded browser IDs include any accepted event; page-bearing browser IDs have at least one recorded page event; visitor rows are source-by-landing rows and are not globally additive. Page-view quality partitions recorded page event rows inside pseudonymous sessions. Pinned sessions may have no page receipt, page sessions contain at least one page receipt, and none of these units proves or disproves a person. Sources remain first-party URL/referrer evidence, not provider-verified platform traffic.')
  from g cross join c cross join rb cross join vt cross join st cross join ps
$$;

revoke all on function public.digitalhut_search_pixel_apply_page_view_quality() from public, anon, authenticated;
revoke all on function public.digitalhut_search_pixel_acquisition_read(integer) from public, anon, authenticated;
grant execute on function public.digitalhut_search_pixel_acquisition_read(integer) to service_role;
