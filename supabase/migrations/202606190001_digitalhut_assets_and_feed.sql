-- DigitalHut production Supabase setup.
-- Run this once in the Supabase SQL editor after the project is unpaused.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'digitalhut-assets',
  'digitalhut-assets',
  true,
  524288000,
  array[
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream',
    'application/json',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'application/zip'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "DigitalHut public asset read" on storage.objects;
create policy "DigitalHut public asset read"
on storage.objects
for select
to public
using (bucket_id = 'digitalhut-assets');

drop policy if exists "DigitalHut authenticated asset upload" on storage.objects;
create policy "DigitalHut authenticated asset upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'digitalhut-assets');

drop policy if exists "DigitalHut authenticated asset update" on storage.objects;
create policy "DigitalHut authenticated asset update"
on storage.objects
for update
to authenticated
using (bucket_id = 'digitalhut-assets')
with check (bucket_id = 'digitalhut-assets');

drop policy if exists "DigitalHut authenticated asset delete" on storage.objects;
create policy "DigitalHut authenticated asset delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'digitalhut-assets');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.digitalhut_asset_conversions (
  id text primary key,
  slug text unique not null,
  name text not null,
  source_type text not null,
  original_file_url text,
  original_bucket_path text,
  converted_glb_url text,
  optimized_glb_url text,
  thumbnail_url text,
  metadata jsonb not null default '{}'::jsonb,
  ai_narration jsonb not null default '[]'::jsonb,
  protected_demo jsonb not null default '{}'::jsonb,
  stage text not null default 'accepted',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'Accepted',
  visibility text not null default 'Private until published',
  likes integer not null default 0,
  shares integer not null default 0,
  comments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_digitalhut_asset_conversions_updated_at on public.digitalhut_asset_conversions;
create trigger set_digitalhut_asset_conversions_updated_at
before update on public.digitalhut_asset_conversions
for each row execute function public.set_updated_at();

create index if not exists digitalhut_asset_conversions_slug_idx on public.digitalhut_asset_conversions (slug);
create index if not exists digitalhut_asset_conversions_stage_idx on public.digitalhut_asset_conversions (stage);
create index if not exists digitalhut_asset_conversions_visibility_idx on public.digitalhut_asset_conversions (visibility);

create table if not exists public.digitalhut_assets (
  id uuid primary key default gen_random_uuid(),
  conversion_id text references public.digitalhut_asset_conversions(id) on delete set null,
  slug text unique not null,
  title text not null,
  category text not null default 'Mainstream Streaming',
  description text not null default '',
  glb_url text not null,
  thumbnail_url text,
  source_url text,
  storage_bucket text not null default 'digitalhut-assets',
  storage_path text,
  file_type text not null default 'glb',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  narration jsonb not null default '[]'::jsonb,
  sponsor jsonb not null default '{}'::jsonb,
  visibility text not null default 'public',
  likes integer not null default 0,
  shares integer not null default 0,
  comments jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_digitalhut_assets_updated_at on public.digitalhut_assets;
create trigger set_digitalhut_assets_updated_at
before update on public.digitalhut_assets
for each row execute function public.set_updated_at();

create index if not exists digitalhut_assets_category_idx on public.digitalhut_assets (category);
create index if not exists digitalhut_assets_slug_idx on public.digitalhut_assets (slug);
create index if not exists digitalhut_assets_visibility_idx on public.digitalhut_assets (visibility);
create index if not exists digitalhut_assets_tags_idx on public.digitalhut_assets using gin (tags);
create index if not exists digitalhut_assets_metadata_idx on public.digitalhut_assets using gin (metadata);

create table if not exists public.digitalhut_live_feed (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.digitalhut_assets(id) on delete set null,
  category text,
  title text,
  description text,
  prompt text,
  source_url text,
  glb_url text,
  thumbnail_url text,
  share_url text,
  metrics jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ai_message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists digitalhut_live_feed_created_at_idx on public.digitalhut_live_feed (created_at desc);
create index if not exists digitalhut_live_feed_category_idx on public.digitalhut_live_feed (category);
create index if not exists digitalhut_live_feed_metadata_idx on public.digitalhut_live_feed using gin (metadata);

alter table public.digitalhut_asset_conversions enable row level security;
alter table public.digitalhut_assets enable row level security;
alter table public.digitalhut_live_feed enable row level security;

drop policy if exists "DigitalHut service manages conversions" on public.digitalhut_asset_conversions;
create policy "DigitalHut service manages conversions"
on public.digitalhut_asset_conversions
for all
to service_role
using (true)
with check (true);

drop policy if exists "DigitalHut public reads published assets" on public.digitalhut_assets;
create policy "DigitalHut public reads published assets"
on public.digitalhut_assets
for select
to public
using (visibility = 'public');

drop policy if exists "DigitalHut authenticated manages own assets" on public.digitalhut_assets;
create policy "DigitalHut authenticated manages own assets"
on public.digitalhut_assets
for all
to authenticated
using (created_by = auth.uid() or created_by is null)
with check (created_by = auth.uid() or created_by is null);

drop policy if exists "DigitalHut service manages assets" on public.digitalhut_assets;
create policy "DigitalHut service manages assets"
on public.digitalhut_assets
for all
to service_role
using (true)
with check (true);

drop policy if exists "DigitalHut public reads live feed" on public.digitalhut_live_feed;
create policy "DigitalHut public reads live feed"
on public.digitalhut_live_feed
for select
to public
using (true);

drop policy if exists "DigitalHut public creates live feed posts" on public.digitalhut_live_feed;
create policy "DigitalHut public creates live feed posts"
on public.digitalhut_live_feed
for insert
to anon, authenticated
with check (true);

drop policy if exists "DigitalHut service manages live feed" on public.digitalhut_live_feed;
create policy "DigitalHut service manages live feed"
on public.digitalhut_live_feed
for all
to service_role
using (true)
with check (true);

insert into public.digitalhut_assets (
  slug,
  title,
  category,
  description,
  glb_url,
  thumbnail_url,
  storage_path,
  tags,
  metadata,
  narration,
  visibility
)
values
  (
    'international-space-elevator',
    'International Space Elevator',
    'Orbital Compute',
    'A production-ready orbital infrastructure model used for planetary, aerospace, and observatory presentation lanes.',
    '/models/firecuda-library/international_space_elevator.glb',
    '/models/firecuda-library/international_space_elevator.png',
    'firecuda-library/international_space_elevator.glb',
    array['orbital-compute', 'space', 'infrastructure', 'environment'],
    '{"source":"local-firecuda-backup","environment":true}'::jsonb,
    '["Open 3D model view. This orbital compute asset is ready for the DigitalHut presenter.", "I am checking structure, scale, and free-space infrastructure context."]'::jsonb,
    'public'
  ),
  (
    'museum-of-ice-cream-singapore-welcome',
    'Museum of Ice Cream Singapore Welcome',
    'Mainstream Streaming',
    'A public environment model used as a lightweight social and travel presentation asset.',
    '/models/firecuda-library/museum_of_ice_cream_singapore_-_welcome.glb',
    '/models/firecuda-library/museum_of_ice_cream_singapore_-_welcome.png',
    'firecuda-library/museum_of_ice_cream_singapore_-_welcome.glb',
    array['mainstream', 'travel', 'venue', 'environment'],
    '{"source":"local-firecuda-backup","environment":true}'::jsonb,
    '["Open 3D model view. This venue environment is ready for the public feed.", "I am reading the visitor layout, travel context, and visual presentation angle."]'::jsonb,
    'public'
  )
on conflict (slug) do update
set
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  glb_url = excluded.glb_url,
  thumbnail_url = excluded.thumbnail_url,
  storage_path = excluded.storage_path,
  tags = excluded.tags,
  metadata = excluded.metadata,
  narration = excluded.narration,
  visibility = excluded.visibility,
  updated_at = now();
