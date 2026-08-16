-- Audit log table for breach detection and compliance
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource text,
  record_id text,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Only service role can insert/read audit logs
alter table public.audit_logs enable row level security;

create policy "Service role only" on public.audit_logs
  using (false)
  with check (false);

-- Index for fast queries by user and time
create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs(action);

-- Kill switch state table
create table if not exists public.system_flags (
  key text primary key,
  value boolean not null default false,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

insert into public.system_flags (key, value) values ('killswitch_active', false)
  on conflict (key) do nothing;

alter table public.system_flags enable row level security;

create policy "Service role only" on public.system_flags
  using (false)
  with check (false);
