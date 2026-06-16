-- ============================================================
-- Roles & Finance — RLS additions
-- ============================================================

-- Update role check constraint to include new roles
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('patient','doctor','pharmacist','admin','analyst','nurse','marketing','frontdesk','owner'));

-- Add finance_admin column if not present (safe to run if already exists)
alter table public.users add column if not exists finance_admin boolean not null default false;

-- ---- Expand admin policies to include owner ----
drop policy if exists "users_select_admin" on public.users;
create policy "users_select_admin"
  on public.users for select
  using (public.current_user_role() in ('admin','analyst','owner'));

drop policy if exists "users_insert_admin" on public.users;
create policy "users_insert_admin"
  on public.users for insert
  with check (public.current_user_role() in ('admin','owner'));

drop policy if exists "consultations_admin_select" on public.consultations;
create policy "consultations_admin_select"
  on public.consultations for select
  using (public.current_user_role() in ('admin','owner'));

drop policy if exists "prescriptions_admin_select" on public.prescriptions;
create policy "prescriptions_admin_select"
  on public.prescriptions for select
  using (public.current_user_role() in ('admin','owner'));

-- ---- Nurse policies ----
create policy "consultations_nurse_select"
  on public.consultations for select
  using (public.current_user_role() = 'nurse');

create policy "consultations_nurse_update"
  on public.consultations for update
  using (public.current_user_role() = 'nurse');

alter table public.vitals enable row level security;

create policy "vitals_nurse_insert"
  on public.vitals for insert
  with check (public.current_user_role() = 'nurse');

create policy "vitals_nurse_select"
  on public.vitals for select
  using (public.current_user_role() = 'nurse');

create policy "vitals_doctor_select"
  on public.vitals for select
  using (public.current_user_role() = 'doctor');

create policy "vitals_admin_select"
  on public.vitals for select
  using (public.current_user_role() in ('admin','owner'));

-- ---- Frontdesk policies ----
create policy "users_select_frontdesk"
  on public.users for select
  using (
    public.current_user_role() = 'frontdesk'
    and role = 'patient'
  );

create policy "consultations_frontdesk_select"
  on public.consultations for select
  using (public.current_user_role() = 'frontdesk');

create policy "consultations_frontdesk_insert"
  on public.consultations for insert
  with check (public.current_user_role() = 'frontdesk');

-- ---- Marketing policies ----
alter table public.campaigns enable row level security;

create policy "campaigns_marketing_select"
  on public.campaigns for select
  using (public.current_user_role() in ('marketing','admin','owner'));

alter table public.leads enable row level security;

create policy "leads_marketing_select"
  on public.leads for select
  using (public.current_user_role() in ('marketing','admin','owner'));

create policy "leads_marketing_update"
  on public.leads for update
  using (public.current_user_role() in ('marketing','admin','owner'));

-- ---- Earnings — My Pay (own rows only via session) ----
alter table public.earnings enable row level security;

create policy "earnings_select_own"
  on public.earnings for select
  using (person_id = auth.uid());

create policy "earnings_select_finance_admin"
  on public.earnings for select
  using (public.is_finance_admin());

-- ---- Company Financials — finance_admin only ----
alter table public.company_financials enable row level security;

create policy "company_financials_finance_admin_select"
  on public.company_financials for select
  using (public.is_finance_admin());

-- ---- GRANTS for new tables ----
grant all on public.vitals             to service_role;
grant all on public.campaigns          to service_role;
grant all on public.leads              to service_role;
grant all on public.earnings           to service_role;
grant all on public.company_financials to service_role;

grant select, insert, update on public.vitals    to authenticated;
grant select                 on public.campaigns  to authenticated;
grant select, update         on public.leads      to authenticated;
grant select                 on public.earnings   to authenticated;
grant select                 on public.company_financials to authenticated;
