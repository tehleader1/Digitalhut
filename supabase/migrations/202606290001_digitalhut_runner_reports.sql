create table if not exists public.digitalhut_runner_reports (
  id uuid primary key default gen_random_uuid(),
  runner_id text not null,
  report_type text not null default 'overnight',
  score integer not null default 0,
  summary text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists digitalhut_runner_reports_created_at_idx
  on public.digitalhut_runner_reports (created_at desc);

create index if not exists digitalhut_runner_reports_runner_id_idx
  on public.digitalhut_runner_reports (runner_id);

alter table public.digitalhut_runner_reports enable row level security;

drop policy if exists "DigitalHut runner reports are publicly readable" on public.digitalhut_runner_reports;
create policy "DigitalHut runner reports are publicly readable"
  on public.digitalhut_runner_reports
  for select
  using (true);

drop policy if exists "DigitalHut service role writes runner reports" on public.digitalhut_runner_reports;
create policy "DigitalHut service role writes runner reports"
  on public.digitalhut_runner_reports
  for insert
  with check (auth.role() = 'service_role');
