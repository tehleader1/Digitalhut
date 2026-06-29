create extension if not exists vector;

create table if not exists public.digitalhut_memory_vectors (
  id uuid primary key default gen_random_uuid(),
  memory_type text not null,
  source_system text not null default 'digitalhut',
  source_id text,
  title text not null default '',
  content text not null default '',
  seo_keywords text[] not null default '{}',
  category text,
  node_key text,
  asset_url text,
  firecuda_path text,
  wallet_tier text,
  visibility text not null default 'owner',
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists digitalhut_memory_vectors_type_idx
  on public.digitalhut_memory_vectors (memory_type);

create index if not exists digitalhut_memory_vectors_category_idx
  on public.digitalhut_memory_vectors (category);

create index if not exists digitalhut_memory_vectors_node_key_idx
  on public.digitalhut_memory_vectors (node_key);

create index if not exists digitalhut_memory_vectors_created_at_idx
  on public.digitalhut_memory_vectors (created_at desc);

create index if not exists digitalhut_memory_vectors_metadata_idx
  on public.digitalhut_memory_vectors using gin (metadata);

create index if not exists digitalhut_memory_vectors_keywords_idx
  on public.digitalhut_memory_vectors using gin (seo_keywords);

create index if not exists digitalhut_memory_vectors_embedding_idx
  on public.digitalhut_memory_vectors
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100)
  where embedding is not null;

alter table public.digitalhut_memory_vectors enable row level security;

drop policy if exists "DigitalHut public vectors are readable" on public.digitalhut_memory_vectors;
create policy "DigitalHut public vectors are readable"
  on public.digitalhut_memory_vectors
  for select
  using (visibility = 'public');

drop policy if exists "DigitalHut service role manages vectors" on public.digitalhut_memory_vectors;
create policy "DigitalHut service role manages vectors"
  on public.digitalhut_memory_vectors
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.match_digitalhut_memory_vectors(
  query_embedding vector(1536),
  match_count int default 10,
  filter_memory_type text default null,
  filter_category text default null
)
returns table (
  id uuid,
  memory_type text,
  source_system text,
  source_id text,
  title text,
  content text,
  seo_keywords text[],
  category text,
  node_key text,
  asset_url text,
  firecuda_path text,
  wallet_tier text,
  visibility text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    digitalhut_memory_vectors.id,
    digitalhut_memory_vectors.memory_type,
    digitalhut_memory_vectors.source_system,
    digitalhut_memory_vectors.source_id,
    digitalhut_memory_vectors.title,
    digitalhut_memory_vectors.content,
    digitalhut_memory_vectors.seo_keywords,
    digitalhut_memory_vectors.category,
    digitalhut_memory_vectors.node_key,
    digitalhut_memory_vectors.asset_url,
    digitalhut_memory_vectors.firecuda_path,
    digitalhut_memory_vectors.wallet_tier,
    digitalhut_memory_vectors.visibility,
    digitalhut_memory_vectors.metadata,
    1 - (digitalhut_memory_vectors.embedding <=> query_embedding) as similarity
  from public.digitalhut_memory_vectors
  where digitalhut_memory_vectors.embedding is not null
    and (filter_memory_type is null or digitalhut_memory_vectors.memory_type = filter_memory_type)
    and (filter_category is null or digitalhut_memory_vectors.category = filter_category)
  order by digitalhut_memory_vectors.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function public.digitalhut_memory_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists digitalhut_memory_vectors_touch_updated_at on public.digitalhut_memory_vectors;
create trigger digitalhut_memory_vectors_touch_updated_at
  before update on public.digitalhut_memory_vectors
  for each row
  execute function public.digitalhut_memory_touch_updated_at();
