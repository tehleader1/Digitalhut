begin;

create table if not exists public.digitalhut_subscription_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier_id text not null check (tier_id in ('tier-standard', 'tier-premium', 'tier-pro')),
  provider text not null default 'paypal' check (provider = 'paypal'),
  provider_subscription_id text not null unique,
  provider_plan_id text not null,
  provider_status text not null,
  state text not null check (state in ('active', 'grace', 'suspended', 'canceled', 'expired', 'refunded', 'disputed', 'chargeback')),
  receipt_version bigint not null default 1 check (receipt_version > 0),
  provider_receipt jsonb not null default '{}'::jsonb,
  verified_at timestamptz not null default now(),
  access_ends_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.digitalhut_subscription_entitlements enable row level security;
revoke all on public.digitalhut_subscription_entitlements from anon, authenticated;
grant select on public.digitalhut_subscription_entitlements to authenticated;
grant select, insert, update on public.digitalhut_subscription_entitlements to service_role;

drop policy if exists "users read their subscription entitlement" on public.digitalhut_subscription_entitlements;
create policy "users read their subscription entitlement"
on public.digitalhut_subscription_entitlements
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.digitalhut_record_paypal_entitlement(
  p_user_id uuid,
  p_tier_id text,
  p_subscription_id text,
  p_plan_id text,
  p_provider_status text,
  p_provider_receipt jsonb default '{}'::jsonb,
  p_access_ends_at timestamptz default null
)
returns public.digitalhut_subscription_entitlements
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_state text;
  v_row public.digitalhut_subscription_entitlements;
begin
  if p_tier_id not in ('tier-standard', 'tier-premium', 'tier-pro') then
    raise exception 'invalid-tier';
  end if;
  if p_subscription_id is null or length(p_subscription_id) < 8 or length(p_subscription_id) > 160 then
    raise exception 'invalid-subscription-id';
  end if;
  if p_plan_id is null or length(p_plan_id) < 3 or length(p_plan_id) > 180 then
    raise exception 'invalid-plan-id';
  end if;

  v_state := case upper(coalesce(p_provider_status, ''))
    when 'ACTIVE' then 'active'
    when 'APPROVAL_PENDING' then 'grace'
    when 'SUSPENDED' then 'suspended'
    when 'CANCELLED' then 'canceled'
    when 'CANCELED' then 'canceled'
    when 'EXPIRED' then 'expired'
    when 'REFUNDED' then 'refunded'
    when 'DISPUTED' then 'disputed'
    when 'CHARGEBACK' then 'chargeback'
    else null
  end;
  if v_state is null then
    raise exception 'unsupported-provider-status';
  end if;

  insert into public.digitalhut_subscription_entitlements (
    user_id,
    tier_id,
    provider_subscription_id,
    provider_plan_id,
    provider_status,
    state,
    provider_receipt,
    verified_at,
    access_ends_at
  ) values (
    p_user_id,
    p_tier_id,
    p_subscription_id,
    p_plan_id,
    upper(p_provider_status),
    v_state,
    coalesce(p_provider_receipt, '{}'::jsonb),
    now(),
    p_access_ends_at
  )
  on conflict (user_id) do update set
    tier_id = excluded.tier_id,
    provider_subscription_id = excluded.provider_subscription_id,
    provider_plan_id = excluded.provider_plan_id,
    provider_status = excluded.provider_status,
    state = excluded.state,
    receipt_version = public.digitalhut_subscription_entitlements.receipt_version + 1,
    provider_receipt = excluded.provider_receipt,
    verified_at = excluded.verified_at,
    access_ends_at = excluded.access_ends_at,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.digitalhut_record_paypal_entitlement(uuid, text, text, text, text, jsonb, timestamptz) from public, anon, authenticated;
grant execute on function public.digitalhut_record_paypal_entitlement(uuid, text, text, text, text, jsonb, timestamptz) to service_role;

commit;
