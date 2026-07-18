-- Additive read-contract upgrade. This does not rewrite event or rollup history.
-- It separates recorded preview/test page activity from the non-preview remainder
-- while keeping browser IDs and sessions in their own non-human units.

create or replace function public.digitalhut_search_pixel_acquisition_read(p_limit integer default 24)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  with g as (select id, total_events, page_views from public.digitalhut_search_pixel_global_summary where id = true),
  c as (select coalesce(sum(events),0)::bigint rollup_events, coalesce(sum(page_views),0)::bigint rollup_page_views,
    coalesce(sum(first_landing_views),0)::bigint first_landing_views, coalesce(sum(later_navigation_views),0)::bigint later_navigation_views,
    coalesce(sum(repeated_same_route_views),0)::bigint repeated_same_route_views, coalesce(sum(verified_conversions),0)::bigint live_verified_conversions,
    count(*)::bigint row_count from public.digitalhut_search_pixel_acquisition_rollups),
  rb as (select count(*)::bigint recorded_browser_ids from public.digitalhut_search_pixel_unique_visitors),
  vt as (select count(*)::bigint visitor_rows, count(distinct visitor_hash)::bigint page_bearing_browser_ids
    from public.digitalhut_search_pixel_acquisition_visitors),
  st as (select count(*)::bigint session_rows from public.digitalhut_search_pixel_acquisition_sessions),
  ps as (select count(*)::bigint page_sessions from public.digitalhut_search_pixel_page_session_state),
  pt as (select
    (select coalesce(sum(page_views),0)::bigint from public.digitalhut_search_pixel_acquisition_rollups
      where source_bucket='vercel-preview-or-test') preview_or_test_page_views,
    (select count(*)::bigint from public.digitalhut_search_pixel_acquisition_sessions
      where source_bucket='vercel-preview-or-test') preview_or_test_pinned_sessions,
    (select count(*)::bigint from public.digitalhut_search_pixel_page_session_state
      where source_bucket='vercel-preview-or-test') preview_or_test_page_sessions),
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
      and c.first_landing_views+c.later_navigation_views+c.repeated_same_route_views=g.page_views
      and pt.preview_or_test_page_views between 0 and g.page_views
      and pt.preview_or_test_pinned_sessions<=st.session_rows
      and pt.preview_or_test_page_sessions<=ps.page_sessions
      and pt.preview_or_test_page_sessions<=pt.preview_or_test_pinned_sessions
      and pt.preview_or_test_page_views+(g.page_views-pt.preview_or_test_page_views)=g.page_views,
    'sourceUnit','first-recorded-page-source-evidence','sourceAttributionVerified',false,
    'visitorUnit','pseudonymous-browser-ids','humanCountVerified',false,'visitorCountsAdditive',false,
    'recordedBrowserIdScope','any-accepted-event','pageBearingBrowserIdScope','at-least-one-recorded-page-event',
    'pageViewQualityUnit','recorded-page-event-rows-partitioned-within-pseudonymous-sessions',
    'pageViewQualityCountsPeople',false,'liveVerifiedOnly',true,
    'previewTestUnit','recorded-page-events-and-pseudonymous-sessions','previewTestCountsPeople',false,
    'knownAutomationSignaturesExcludedFromNewIngestion',true,'automationFullyExcluded',false,
    'historyScope','all-recorded-events-reconstructed-to-earliest-page-or-event-per-session',
    'coverage',jsonb_build_object('rollupEvents',c.rollup_events,'durableEvents',coalesce(g.total_events,0),
      'rollupPageViews',c.rollup_page_views,'durablePageViews',coalesce(g.page_views,0),'firstLandingViews',c.first_landing_views,
      'laterNavigationViews',c.later_navigation_views,'repeatedSameRouteViews',c.repeated_same_route_views,
      'previewOrTestPageViews',pt.preview_or_test_page_views,
      'nonPreviewRecordedPageViews',g.page_views-pt.preview_or_test_page_views,
      'previewOrTestPinnedSessions',pt.preview_or_test_pinned_sessions,
      'previewOrTestPageSessions',pt.preview_or_test_page_sessions,
      'rowCount',c.row_count,'recordedBrowserIds',rb.recorded_browser_ids,
      'pageBearingBrowserIds',vt.page_bearing_browser_ids,'visitorRows',vt.visitor_rows,
      'sessionRows',st.session_rows,'pinnedSessions',st.session_rows,'pageSessions',ps.page_sessions,
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
    'truthBoundary','Recorded browser IDs include any accepted event; page-bearing browser IDs have at least one recorded page event; visitor rows are source-by-landing rows and are not globally additive. Page-view quality partitions recorded page event rows inside pseudonymous sessions. Preview/test totals are recorded page events and pseudonymous sessions identified by first-party source evidence; they are neither human counts nor provider-verified traffic, and they do not subtract or derive browser IDs. Pinned sessions may have no page receipt, page sessions contain at least one page receipt, and none of these units proves or disproves a person.')
  from g cross join c cross join rb cross join vt cross join st cross join ps cross join pt
$$;

revoke all on function public.digitalhut_search_pixel_acquisition_read(integer) from public, anon, authenticated;
grant execute on function public.digitalhut_search_pixel_acquisition_read(integer) to service_role;
