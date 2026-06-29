create table if not exists public.digitalhut_runner_messages (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('anthony', 'runner', 'system')),
  message text not null default '',
  message_type text not null default 'chat',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists digitalhut_runner_messages_created_at_idx
  on public.digitalhut_runner_messages (created_at desc);

create index if not exists digitalhut_runner_messages_type_idx
  on public.digitalhut_runner_messages (message_type);

alter table public.digitalhut_runner_messages enable row level security;

drop policy if exists "DigitalHut runner messages are publicly readable" on public.digitalhut_runner_messages;
create policy "DigitalHut runner messages are publicly readable"
  on public.digitalhut_runner_messages
  for select
  using (true);

drop policy if exists "DigitalHut service role manages runner messages" on public.digitalhut_runner_messages;
create policy "DigitalHut service role manages runner messages"
  on public.digitalhut_runner_messages
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
