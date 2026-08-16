-- payments table: records PayPal (and future) transactions for patient subscriptions

create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  provider     text not null default 'paypal',
  order_id     text,
  plan         text,              -- 'solo' | 'family'
  amount       numeric(10,2),
  currency     text default 'USD',
  status       text default 'completed',
  created_at   timestamptz default now()
);

-- index for user payment history lookups
create index if not exists payments_user_id_idx on public.payments(user_id);

-- RLS: users can read their own payments; service role can insert
alter table public.payments enable row level security;

drop policy if exists "users read own payments" on public.payments;
create policy "users read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- paypal_email column on users table for doctor payout preference
alter table public.users
  add column if not exists paypal_email text;
