create table if not exists public.digitalhut_blog_drafts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft',
  title text not null,
  slug text not null unique,
  category text not null default 'DigitalHut Observatory',
  primary_keyword text not null default '',
  seo_keywords text[] not null default '{}',
  summary text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  firecuda_path text,
  source_runner_id text,
  source_report_generated_at timestamptz,
  publish_window text not null default 'editorial-review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists digitalhut_blog_drafts_status_idx
  on public.digitalhut_blog_drafts (status);

create index if not exists digitalhut_blog_drafts_created_at_idx
  on public.digitalhut_blog_drafts (created_at desc);

create index if not exists digitalhut_blog_drafts_keywords_idx
  on public.digitalhut_blog_drafts using gin (seo_keywords);

create index if not exists digitalhut_blog_drafts_evidence_idx
  on public.digitalhut_blog_drafts using gin (evidence);

alter table public.digitalhut_blog_drafts enable row level security;

drop policy if exists "DigitalHut published blogs are readable" on public.digitalhut_blog_drafts;
create policy "DigitalHut published blogs are readable"
  on public.digitalhut_blog_drafts
  for select
  using (status = 'published');

drop policy if exists "DigitalHut service role manages blog drafts" on public.digitalhut_blog_drafts;
create policy "DigitalHut service role manages blog drafts"
  on public.digitalhut_blog_drafts
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.digitalhut_blog_drafts_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists digitalhut_blog_drafts_touch_updated_at on public.digitalhut_blog_drafts;
create trigger digitalhut_blog_drafts_touch_updated_at
  before update on public.digitalhut_blog_drafts
  for each row
  execute function public.digitalhut_blog_drafts_touch_updated_at();
