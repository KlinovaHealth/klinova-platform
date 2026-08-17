-- ============================================================
-- KLINOVA: CONSENT LEDGER
-- Immutable record of every consent given or withdrawn.
-- Never delete rows — only withdraw (soft).
-- ============================================================

CREATE TABLE IF NOT EXISTS consent_records (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type     text        NOT NULL,
  -- whatsapp_comms  — consent to receive WhatsApp messages
  -- telehealth      — consent to use Klinova telemedicine services
  -- location        — consent to share device location
  -- analytics       — consent to include data in anonymised analytics
  -- research        — consent to include in research/public-health studies
  consented        boolean     NOT NULL,
  version          text        NOT NULL DEFAULT '1.0',
  language         text        NOT NULL DEFAULT 'en',
  channel          text        NOT NULL DEFAULT 'web',
  -- web | whatsapp | in-app | sms
  ip_hash          text,       -- SHA-256 of IP; never store raw IP in consent records
  withdrawn_at     timestamptz,
  withdrawn_channel text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Consent types are known values
ALTER TABLE consent_records
  ADD CONSTRAINT consent_type_check
  CHECK (consent_type IN (
    'whatsapp_comms', 'telehealth', 'location', 'analytics', 'research'
  ));

-- Indexes for fast per-patient lookups
CREATE INDEX IF NOT EXISTS consent_patient_type_idx
  ON consent_records(patient_id, consent_type, created_at DESC);

CREATE INDEX IF NOT EXISTS consent_active_idx
  ON consent_records(patient_id, consent_type)
  WHERE withdrawn_at IS NULL AND consented = true;

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Patients can only see and manage their own consent
CREATE POLICY "consent_own_select" ON consent_records FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "consent_own_insert" ON consent_records FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Admin/owner can read all (for compliance audit) but cannot insert/delete
CREATE POLICY "consent_admin_select" ON consent_records FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner'))
  );

-- Withdraw = update withdrawn_at only (patients can only update own)
CREATE POLICY "consent_own_withdraw" ON consent_records FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- ── Helper: check active consent ─────────────────────────────
-- Returns true if patient has given (and not withdrawn) the consent type.
CREATE OR REPLACE FUNCTION has_active_consent(
  p_patient_id uuid,
  p_type       text
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM consent_records
      WHERE patient_id    = p_patient_id
        AND consent_type  = p_type
        AND consented     = true
        AND withdrawn_at  IS NULL
      ORDER BY created_at DESC
      LIMIT 1
  );
$$;

-- ── Helper: latest consent state per type ────────────────────
CREATE OR REPLACE FUNCTION get_consent_summary(p_patient_id uuid)
RETURNS TABLE (
  consent_type  text,
  consented     boolean,
  version       text,
  language      text,
  given_at      timestamptz,
  withdrawn_at  timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (consent_type)
    consent_type, consented, version, language, created_at, withdrawn_at
  FROM consent_records
  WHERE patient_id = p_patient_id
  ORDER BY consent_type, created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION has_active_consent(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_consent_summary(uuid)       TO authenticated;
