create table if not exists public.digitalhut_search_pixel_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  session_id text not null,
  visitor_id text,
  path text not null default '',
  referrer text,
  title text,
  search text,
  source text not null default 'digitalhut-search-pixel',
  keyword_hint text,
  category text,
  asset_id text,
  blog_slug text,
  wallet_address text,
  node_key text,
  tier_key text,
  metadata jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists digitalhut_search_pixel_events_created_at_idx
  on public.digitalhut_search_pixel_events (created_at desc);

create index if not exists digitalhut_search_pixel_events_event_name_idx
  on public.digitalhut_search_pixel_events (event_name);

create index if not exists digitalhut_search_pixel_events_session_idx
  on public.digitalhut_search_pixel_events (session_id);

create index if not exists digitalhut_search_pixel_events_path_idx
  on public.digitalhut_search_pixel_events (path);

create index if not exists digitalhut_search_pixel_events_blog_slug_idx
  on public.digitalhut_search_pixel_events (blog_slug);

create index if not exists digitalhut_search_pixel_events_metadata_idx
  on public.digitalhut_search_pixel_events using gin (metadata);

alter table public.digitalhut_search_pixel_events enable row level security;

drop policy if exists "DigitalHut service role manages search pixel events" on public.digitalhut_search_pixel_events;
create policy "DigitalHut service role manages search pixel events"
  on public.digitalhut_search_pixel_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
