-- Additive page-receipt classification ledger. It never rewrites or deletes
-- durable audience events and never exposes browser/session hashes publicly.

create extension if not exists pgcrypto with schema extensions;

-- Prospective Stellar controls are explicit actions. They may contribute to
-- continuation evidence, but neither event creates a page receipt or identity.
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
        'node_activation','node_search_submit','thumbnail_render_click','download_click','share_click','library_experience_open',
        'library_share_intent','experience_resume_open'
      ]) then 'explicitHuman'
    else 'otherRecordedEvents'
  end
$$;

create or replace function public.digitalhut_acquisition_is_second_action(p_event_name text, p_metadata jsonb)
returns boolean language sql immutable set search_path=public,pg_temp as $$
  select coalesce(p_metadata ->> 'eventOrigin', '') in ('deliberate-click', 'explicit-input', 'explicit-handler')
    and coalesce(p_event_name, '') = any(array[
      'glb_preview_play','glb_preview_open','glb_replica_play','viral_glb_proof_play',
      'podcast_interrupt_play','podcast_interrupt_start','viral_podcast_source_start',
      'autoplay_start','search_run','youtube_search_submit','search_video_select',
      'ticker_search','market_view_open','market_panel_open','proof_route_open','watch_route_open',
      'blog_route_open','category_proof_open','zone_checkpoint_open','viral_watch_route_open',
      'viral_source_route_open','backlink_source_open','glb_source_click','podcast_source_open',
      'viral_source_backlink_open','node_activation','node_search_submit'
    ])
$$;

revoke all on function public.digitalhut_recorded_event_class(text,jsonb) from public,anon,authenticated;
revoke all on function public.digitalhut_acquisition_is_second_action(text,jsonb) from public,anon,authenticated;

create table if not exists public.digitalhut_search_pixel_page_receipt_classifications (
  event_id uuid primary key references public.digitalhut_search_pixel_events(id) on delete restrict,
  session_hash text not null check (session_hash ~ '^[a-f0-9]{64}$'),
  browser_hash text check (browser_hash is null or browser_hash ~ '^[a-f0-9]{64}$'),
  source_bucket text not null check (source_bucket ~ '^[a-z0-9:-]+$'),
  route_path text not null check (route_path ~ '^/[A-Za-z0-9/_-]*$'),
  receipt_class text not null check (receipt_class = any(array[
    'first-recorded-arrival','same-session-refresh-remount','same-session-deliberate-return',
    'new-session-return','new-day-return','preview-test','known-automatic-activity','unknown-classification'
  ])),
  qualified boolean not null,
  classification_reason text not null check (classification_reason ~ '^[a-z0-9-]{1,80}$'),
  evidence_type text not null default 'none' check (evidence_type ~ '^[a-z0-9-]{1,50}$'),
  deliberate_continuation_evidence boolean not null default false,
  recovered_after_failure boolean not null default false,
  classification_version text not null default 'page-receipt-v1' check (classification_version = 'page-receipt-v1'),
  created_at timestamptz not null
);

create index if not exists digitalhut_page_receipt_class_browser_time_idx
  on public.digitalhut_search_pixel_page_receipt_classifications (browser_hash, created_at)
  where browser_hash is not null;
create index if not exists digitalhut_page_receipt_class_session_time_idx
  on public.digitalhut_search_pixel_page_receipt_classifications (session_hash, created_at);
create index if not exists digitalhut_page_receipt_class_kind_idx
  on public.digitalhut_search_pixel_page_receipt_classifications (receipt_class);

alter table public.digitalhut_search_pixel_page_receipt_classifications enable row level security;
revoke all on table public.digitalhut_search_pixel_page_receipt_classifications from public, anon, authenticated;
grant select, insert on table public.digitalhut_search_pixel_page_receipt_classifications to service_role;

-- Historical browser/session/day boundaries are deterministic. Historical
-- same-session navigation intent is not, so ambiguous receipts fail to unknown.
with page_events as (
  select e.id event_id,
    encode(extensions.digest(convert_to(case when coalesce(e.session_id,'') in ('','anonymous') then 'event:'||e.id::text else e.session_id end,'UTF8'),'sha256'),'hex') session_hash,
    case when nullif(e.visitor_id,'') is null then null
      else encode(extensions.digest(convert_to(e.visitor_id,'UTF8'),'sha256'),'hex') end browser_hash,
    public.digitalhut_acquisition_safe_path(e.path) route_path,
    coalesce(s.source_bucket, public.digitalhut_acquisition_source_bucket(e.referrer,e.path,e.metadata)) source_bucket,
    public.digitalhut_recorded_event_class(e.event_name,coalesce(e.metadata,'{}'::jsonb)) event_class,
    e.created_at,
    e.metadata,
    e.user_agent
  from public.digitalhut_search_pixel_events e
  left join public.digitalhut_search_pixel_acquisition_sessions s on s.session_hash=
    encode(extensions.digest(convert_to(case when coalesce(e.session_id,'') in ('','anonymous') then 'event:'||e.id::text else e.session_id end,'UTF8'),'sha256'),'hex')
  where e.event_name in ('page_view','blog_view')
), ordered as (
  select p.*,
    row_number() over (partition by browser_hash order by created_at,event_id) browser_sequence,
    lag(created_at) over (partition by browser_hash order by created_at,event_id) previous_browser_at,
    lag(session_hash) over (partition by browser_hash order by created_at,event_id) previous_session_hash
  from page_events p
), classified as (
  select o.*,
    case
      when source_bucket='vercel-preview-or-test' then 'preview-test'
      when event_class='systemAutomatic' or coalesce(user_agent,'') ~* '(bot|crawl|spider|slurp|headless|lighthouse|pagespeed)' then 'known-automatic-activity'
      when browser_hash is null then 'unknown-classification'
      when browser_sequence=1 then 'first-recorded-arrival'
      when previous_browser_at::date < created_at::date then 'new-day-return'
      when previous_session_hash is distinct from session_hash then 'new-session-return'
      else 'unknown-classification'
    end receipt_class
  from ordered o
)
insert into public.digitalhut_search_pixel_page_receipt_classifications (
  event_id,session_hash,browser_hash,source_bucket,route_path,receipt_class,qualified,
  classification_reason,evidence_type,deliberate_continuation_evidence,recovered_after_failure,created_at
)
select event_id,session_hash,browser_hash,source_bucket,route_path,receipt_class,
  receipt_class not in ('preview-test','known-automatic-activity'),
  case when receipt_class='unknown-classification' then 'historical-navigation-evidence-unavailable' else receipt_class end,
  'historical-backfill',false,false,created_at
from classified
on conflict (event_id) do nothing;

create or replace function public.digitalhut_search_pixel_apply_page_receipt_classification()
returns trigger language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare
  v_session_key text;
  v_session_hash text;
  v_browser_hash text;
  v_source text;
  v_route text := public.digitalhut_acquisition_safe_path(new.path);
  v_previous_browser_at timestamptz;
  v_previous_session text;
  v_previous_route text;
  v_same_route_seen boolean := false;
  v_class text;
  v_reason text;
  v_evidence_type text := lower(coalesce(new.metadata #>> '{pageReceipt,evidenceType}','none'));
  v_evidence_target text := public.digitalhut_acquisition_safe_path(new.metadata #>> '{pageReceipt,evidenceTargetPath}');
  v_navigation_type text := lower(coalesce(new.metadata #>> '{pageReceipt,browserNavigationType}','unknown'));
  v_navigation_reason text := lower(coalesce(new.metadata #>> '{pageReceipt,reason}',new.metadata->>'reason','unknown'));
  v_deliberate boolean := false;
  v_recovered boolean := lower(coalesce(new.metadata->>'deliveryRecoveredAfterFailure','false'))='true'
    and coalesce((new.metadata->>'deliveryAttempt')::integer,0) between 2 and 8;
begin
  if new.event_name not in ('page_view','blog_view') then return new; end if;
  v_session_key := case when coalesce(new.session_id,'') in ('','anonymous') then 'event:'||new.id::text else new.session_id end;
  v_session_hash := encode(extensions.digest(convert_to(v_session_key,'UTF8'),'sha256'),'hex');
  if nullif(new.visitor_id,'') is not null then
    v_browser_hash := encode(extensions.digest(convert_to(new.visitor_id,'UTF8'),'sha256'),'hex');
    perform pg_advisory_xact_lock(hashtextextended(v_browser_hash,0));
  end if;

  select source_bucket into v_source from public.digitalhut_search_pixel_acquisition_sessions
    where session_hash=v_session_hash for update;
  if not found then raise exception 'page receipt missing pinned acquisition session %',v_session_hash; end if;

  if v_browser_hash is not null then
    select created_at,session_hash,route_path into v_previous_browser_at,v_previous_session,v_previous_route
    from public.digitalhut_search_pixel_page_receipt_classifications
    where browser_hash=v_browser_hash order by created_at desc,event_id desc limit 1;
    select exists(select 1 from public.digitalhut_search_pixel_page_receipt_classifications
      where browser_hash=v_browser_hash and session_hash=v_session_hash and route_path=v_route)
      into v_same_route_seen;
  end if;

  if v_source='vercel-preview-or-test' then v_class:='preview-test';v_reason:='preview-source-bucket';
  elsif public.digitalhut_recorded_event_class(new.event_name,new.metadata)='systemAutomatic'
    or coalesce(new.user_agent,'') ~* '(bot|crawl|spider|slurp|headless|lighthouse|pagespeed)'
    then v_class:='known-automatic-activity';v_reason:='known-automation-evidence';
  elsif v_browser_hash is null then v_class:='unknown-classification';v_reason:='browser-evidence-missing';
  elsif v_previous_browser_at is null then v_class:='first-recorded-arrival';v_reason:='first-browser-page-receipt';
  elsif v_previous_browser_at::date < new.created_at::date then v_class:='new-day-return';v_reason:='prior-page-on-earlier-utc-day';
  elsif v_previous_session is distinct from v_session_hash then v_class:='new-session-return';v_reason:='prior-page-in-different-session';
  elsif v_same_route_seen and v_previous_route is distinct from v_route
    and ((v_evidence_type in ('internal-link-click','history-pop') and v_evidence_target=v_route)
      or (v_evidence_type='history-pop' and v_navigation_reason='popstate'))
    then v_class:='same-session-deliberate-return';v_reason:='observable-route-return-evidence';v_deliberate:=true;
  elsif v_previous_route=v_route and (v_navigation_type='reload' or v_navigation_reason in ('initial','replacestate'))
    then v_class:='same-session-refresh-remount';v_reason:='same-route-browser-navigation-evidence';
  else v_class:='unknown-classification';v_reason:='prospective-evidence-insufficient';
  end if;

  insert into public.digitalhut_search_pixel_page_receipt_classifications (
    event_id,session_hash,browser_hash,source_bucket,route_path,receipt_class,qualified,
    classification_reason,evidence_type,deliberate_continuation_evidence,recovered_after_failure,created_at
  ) values (new.id,v_session_hash,v_browser_hash,v_source,v_route,v_class,
    v_class not in ('preview-test','known-automatic-activity'),v_reason,
    case when v_evidence_type ~ '^[a-z0-9-]{1,50}$' then v_evidence_type else 'invalid' end,
    v_deliberate,v_recovered,new.created_at);
  return new;
exception when invalid_text_representation then
  raise exception 'page receipt delivery evidence invalid';
end
$$;

drop trigger if exists zz_digitalhut_search_pixel_page_receipt_classification_trigger on public.digitalhut_search_pixel_events;
create trigger zz_digitalhut_search_pixel_page_receipt_classification_trigger
after insert on public.digitalhut_search_pixel_events
for each row execute function public.digitalhut_search_pixel_apply_page_receipt_classification();

create or replace function public.digitalhut_search_pixel_page_receipt_read()
returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  with g as (select page_views from public.digitalhut_search_pixel_global_summary where id=true),
  c as (select count(*)::bigint gross,
    count(*) filter(where qualified)::bigint qualified,
    count(*) filter(where receipt_class='first-recorded-arrival')::bigint first_arrival,
    count(*) filter(where receipt_class='same-session-refresh-remount')::bigint refresh_remount,
    count(*) filter(where receipt_class='same-session-deliberate-return')::bigint deliberate_return,
    count(*) filter(where receipt_class='new-session-return')::bigint new_session,
    count(*) filter(where receipt_class='new-day-return')::bigint new_day,
    count(*) filter(where receipt_class='preview-test')::bigint preview_test,
    count(*) filter(where receipt_class='known-automatic-activity')::bigint known_automatic,
    count(*) filter(where receipt_class='unknown-classification')::bigint unknown_classification,
    count(*) filter(where deliberate_continuation_evidence)::bigint deliberate_page_returns,
    count(*) filter(where recovered_after_failure)::bigint recovered_page_receipts
    from public.digitalhut_search_pixel_page_receipt_classifications),
  d as (select count(*)::bigint duplicate_groups from (
    select metadata->>'clientEventId' from public.digitalhut_search_pixel_events
    where nullif(metadata->>'clientEventId','') is not null group by 1 having count(*)>1) x),
  k as (select count(*)::bigint deliberate_continuations
    from public.digitalhut_search_pixel_events e
    where public.digitalhut_acquisition_is_second_action(e.event_name,e.metadata)
      and exists(select 1 from public.digitalhut_search_pixel_page_receipt_classifications p
        where p.session_hash=encode(extensions.digest(convert_to(case when coalesce(e.session_id,'') in ('','anonymous') then 'event:'||e.id::text else e.session_id end,'UTF8'),'sha256'),'hex')
        and p.created_at<=e.created_at))
  select jsonb_build_object(
    'ready',g.page_views=c.gross and c.gross=c.first_arrival+c.refresh_remount+c.deliberate_return+c.new_session+c.new_day+c.preview_test+c.known_automatic+c.unknown_classification
      and c.qualified=c.gross-c.preview_test-c.known_automatic and d.duplicate_groups=0,
    'classificationVersion','page-receipt-v1','unit','accepted-page-receipts','countsPeople',false,
    'grossRecordedPageViews',c.gross,'qualifiedPageViews',c.qualified,
    'qualifiedDefinition','gross-minus-preview-test-and-known-automatic; exact duplicates are suppressed before insertion; unknown remains included',
    'classes',jsonb_build_object('firstRecordedArrival',c.first_arrival,'sameSessionRefreshRemount',c.refresh_remount,
      'sameSessionDeliberateReturn',c.deliberate_return,'newSessionReturn',c.new_session,'newDayReturn',c.new_day,
      'previewTest',c.preview_test,'knownAutomaticActivity',c.known_automatic,'unknownClassification',c.unknown_classification),
    'duplicates',jsonb_build_object('suppressedByClientEventIdUniqueIndex',true,'durableDuplicateGroups',d.duplicate_groups),
    'deliberateContinuations',jsonb_build_object('contractReady',true,'count',k.deliberate_continuations,
      'sameSessionDeliberatePageReturns',c.deliberate_page_returns,'identityCreated',false),
    'interruptionRecovery',jsonb_build_object('contractReady',true,'observed',c.recovered_page_receipts>0,
      'count',c.recovered_page_receipts,'missingReason',case when c.recovered_page_receipts=0 then 'no-recovery-receipt-observed' else '' end),
    'unknown',jsonb_build_object('count',c.unknown_classification,'includedInQualified',true,
      'historicalMissingReason','historical-navigation-evidence-unavailable'),
    'truthBoundary','Every row is an accepted page receipt, not a person. Historical ambiguous same-session navigation remains unknown. Deliberate returns require prospective route/action evidence.')
  from g cross join c cross join d cross join k
$$;

revoke all on function public.digitalhut_search_pixel_apply_page_receipt_classification() from public,anon,authenticated;
revoke all on function public.digitalhut_search_pixel_page_receipt_read() from public,anon,authenticated;
grant execute on function public.digitalhut_search_pixel_page_receipt_read() to service_role;
