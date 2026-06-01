alter table digitalhut_subscriptions
  add column if not exists payment_wallet text,
  add column if not exists payment_chain text default 'unconfirmed';
