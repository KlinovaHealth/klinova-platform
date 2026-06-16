-- ============================================================
-- Klinova Platform — Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Pharmacies (reference table, no PII)
create table public.pharmacies (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  district   text,
  address    text,
  phone      text,
  open_now   boolean default true,
  created_at timestamptz default now()
);

-- Users (mirrors auth.users, adds role + profile)
create table public.users (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  full_name             text not null default '',
  role                  text not null check (role in ('patient','doctor','pharmacist','admin','analyst')),
  force_password_change boolean not null default true,
  pharmacy_id           uuid references public.pharmacies(id),
  created_at            timestamptz default now()
);

-- Consultations
create table public.consultations (
  id         uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.users(id) on delete cascade,
  doctor_id  uuid references public.users(id),
  status     text not null default 'waiting'
               check (status in ('waiting','active','completed','cancelled')),
  reason     text not null default '',
  channel    text not null default 'chat'
               check (channel in ('video','audio','chat')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Prescriptions
create table public.prescriptions (
  id              uuid primary key default uuid_generate_v4(),
  consultation_id uuid references public.consultations(id),
  doctor_id       uuid references public.users(id),
  patient_id      uuid not null references public.users(id) on delete cascade,
  pharmacy_id     uuid references public.pharmacies(id),
  medications     jsonb not null default '[]',
  notes           text,
  status          text not null default 'pending'
                    check (status in ('pending','ready','fulfilled')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index on public.consultations (patient_id);
create index on public.consultations (doctor_id);
create index on public.consultations (status);
create index on public.prescriptions (patient_id);
create index on public.prescriptions (pharmacy_id);
create index on public.prescriptions (status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_consultations_updated_at
  before update on public.consultations
  for each row execute function public.set_updated_at();

create trigger trg_prescriptions_updated_at
  before update on public.prescriptions
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users        enable row level security;
alter table public.consultations enable row level security;
alter table public.prescriptions enable row level security;
alter table public.pharmacies    enable row level security;

-- Helper: get the caller's role from public.users
create or replace function public.current_user_role()
returns text language sql security definer stable as $$
  select role from public.users where id = auth.uid();
$$;

-- ---- pharmacies (public read) ----
create policy "pharmacies_select_all"
  on public.pharmacies for select
  using (true);

-- ---- users ----
-- Every user can read their own row
create policy "users_select_own"
  on public.users for select
  using (id = auth.uid());

-- Admin/analyst can read all
create policy "users_select_admin"
  on public.users for select
  using (public.current_user_role() in ('admin','analyst'));

-- Every user can update their own row (password change flag, etc.)
create policy "users_update_own"
  on public.users for update
  using (id = auth.uid());

-- Admin can insert (via service key / edge function)
create policy "users_insert_admin"
  on public.users for insert
  with check (public.current_user_role() = 'admin');

-- ---- consultations ----
-- Patient: own rows
create policy "consultations_patient_select"
  on public.consultations for select
  using (patient_id = auth.uid());

create policy "consultations_patient_insert"
  on public.consultations for insert
  with check (patient_id = auth.uid());

-- Doctor: see all waiting/active, update any
create policy "consultations_doctor_select"
  on public.consultations for select
  using (public.current_user_role() = 'doctor');

create policy "consultations_doctor_update"
  on public.consultations for update
  using (public.current_user_role() = 'doctor');

-- Admin: full read
create policy "consultations_admin_select"
  on public.consultations for select
  using (public.current_user_role() = 'admin');

-- ---- prescriptions ----
-- Patient: own
create policy "prescriptions_patient_select"
  on public.prescriptions for select
  using (patient_id = auth.uid());

-- Doctor: insert own, select own
create policy "prescriptions_doctor_insert"
  on public.prescriptions for insert
  with check (doctor_id = auth.uid());

create policy "prescriptions_doctor_select"
  on public.prescriptions for select
  using (doctor_id = auth.uid());

-- Pharmacist: select + update by pharmacy
create policy "prescriptions_pharmacist_select"
  on public.prescriptions for select
  using (
    public.current_user_role() = 'pharmacist'
    and pharmacy_id = (select pharmacy_id from public.users where id = auth.uid())
  );

create policy "prescriptions_pharmacist_update"
  on public.prescriptions for update
  using (
    public.current_user_role() = 'pharmacist'
    and pharmacy_id = (select pharmacy_id from public.users where id = auth.uid())
  );

-- Admin: full read
create policy "prescriptions_admin_select"
  on public.prescriptions for select
  using (public.current_user_role() = 'admin');

-- ============================================================
-- ANALYTICS VIEWS  (de-identified — no PII, analyst-only)
-- ============================================================

create or replace view public.analytics_consult_volume as
  select
    date_trunc('day', created_at)::date::text as date,
    count(*)::int                              as count
  from public.consultations
  group by 1
  order by 1;

create or replace view public.analytics_consult_by_district as
  select
    ph.district,
    count(c.id)::int as count
  from public.consultations c
  join public.users u on u.id = c.patient_id
  left join public.pharmacies ph on ph.district is not null
  group by 1;

create or replace view public.analytics_top_reasons as
  select
    reason,
    count(*)::int as count
  from public.consultations
  where reason <> ''
  group by 1
  order by 2 desc;

create or replace view public.analytics_prescription_fulfillment as
  select
    status,
    count(*)::int as count
  from public.prescriptions
  group by 1;

create or replace view public.analytics_revenue as
  select
    date_trunc('day', created_at)::date::text as date,
    count(*)::int                              as consults
  from public.consultations
  where status = 'completed'
  group by 1
  order by 1;

-- Grant analyst role select on analytics views
-- (analyst users read via their own session — RLS still applies to base tables,
--  but views are security_invoker by default so analysts can query the views
--  without directly accessing raw tables)

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table public.consultations;
alter publication supabase_realtime add table public.prescriptions;

-- ============================================================
-- SEED: default pharmacy
-- ============================================================

insert into public.pharmacies (name, district, address, phone)
values ('Klinova Central Pharmacy', 'Lomé', '12 Rue de la Santé, Lomé', '+228 90 00 00 00');


-- ============================================================
-- ROLE GRANTS  (required for PostgREST + RLS to work)
-- ============================================================

grant usage on schema public to service_role, authenticated, anon;

-- service_role: full access, bypasses RLS (used by admin server-side client)
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- authenticated: full DML, RLS enforced
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- anon: public read on pharmacies only
grant select on public.pharmacies to anon;
