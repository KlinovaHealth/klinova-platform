create table if not exists whatsapp_triage (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  wa_phone      text not null,
  patient_name  text,
  transcription text,
  translation   text,
  intent        text,
  urgency       text check (urgency in ('low','medium','high','emergency')),
  language      text,
  summary       text,
  location_lat  double precision,
  location_lng  double precision,
  status        text default 'new' check (status in ('new','awaiting_location','location_received','assigned','resolved')),
  doctor_id     uuid references users(id),
  notes         text
);

-- Doctors can read all triage; only service role can insert (webhook)
alter table whatsapp_triage enable row level security;

create policy "doctors can view triage"
  on whatsapp_triage for select
  using (
    exists (
      select 1 from users
      where id = auth.uid()
      and role in ('doctor','admin','owner')
    )
  );
