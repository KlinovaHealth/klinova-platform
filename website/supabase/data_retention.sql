-- ============================================================
-- KLINOVA: DATA RETENTION & DELETION POLICIES
-- Run monthly via Supabase pg_cron or a Vercel cron job.
-- ============================================================

-- ── Retention periods by data class ──────────────────────────
-- Triage records (PHI): 7 years (clinical record standard, West Africa)
-- Consultation records: 10 years (legal minimum for medical records)
-- Prescriptions:        10 years
-- Audit logs:           5 years (regulatory compliance)
-- Consent records:      Kept indefinitely (proof of consent)
-- WhatsApp sessions:    90 days for operational, then anonymise
-- Analytics events:     2 years (aggregated), then purge
-- Breach/incident logs: 5 years

-- ── Anonymise old triage records (>7 years) ──────────────────
-- Rather than delete, we null out PHI columns to preserve
-- the aggregate signal for epidemiological use.
CREATE OR REPLACE FUNCTION anonymise_aged_triage()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE whatsapp_triage
  SET
    wa_phone         = NULL,
    wa_phone_enc     = NULL,
    patient_name     = NULL,
    patient_name_enc = NULL,
    transcription    = NULL,
    transcription_enc = NULL,
    translation      = NULL,
    translation_enc  = NULL,
    summary          = NULL,
    summary_enc      = NULL,
    notes            = NULL,
    notes_enc        = NULL,
    location_lat     = NULL,
    location_lng     = NULL,
    location_enc     = NULL
  WHERE created_at < now() - interval '7 years'
    AND wa_phone IS NOT NULL; -- only run if not already anonymised

  -- Log the action
  INSERT INTO audit_logs (action, resource, metadata)
  VALUES (
    'DATA_RETENTION_ANONYMISE',
    'whatsapp_triage',
    jsonb_build_object('ran_at', now(), 'policy', '7_year_triage')
  );
END;
$$;

-- ── Purge old audit logs (>5 years) ──────────────────────────
CREATE OR REPLACE FUNCTION purge_aged_audit_logs()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  deleted_count bigint;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < now() - interval '5 years';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- This log entry itself stays (created_at = now)
  INSERT INTO audit_logs (action, resource, metadata)
  VALUES (
    'DATA_RETENTION_PURGE',
    'audit_logs',
    jsonb_build_object(
      'ran_at', now(),
      'policy', '5_year_audit_logs',
      'rows_deleted', deleted_count
    )
  );
END;
$$;

-- ── Purge withdrawn consent older than 7 years ───────────────
CREATE OR REPLACE FUNCTION purge_aged_consent()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  DELETE FROM consent_records
  WHERE withdrawn_at IS NOT NULL
    AND withdrawn_at < now() - interval '7 years';

  INSERT INTO audit_logs (action, resource, metadata)
  VALUES (
    'DATA_RETENTION_PURGE',
    'consent_records',
    jsonb_build_object('ran_at', now(), 'policy', '7_year_withdrawn_consent')
  );
END;
$$;

-- ── Patient deletion (right to erasure) ──────────────────────
-- GDPR/local law: patient can request full deletion.
-- We anonymise clinical records (can't delete — other parties have rights to them)
-- but delete direct identifiers.
CREATE OR REPLACE FUNCTION delete_patient_data(p_patient_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  -- Caller must be admin/owner
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
  ) THEN
    RAISE EXCEPTION 'Access denied: admin or owner required';
  END IF;

  -- Triage records are phone-based. Without users.phone we can't reverse-link
  -- them to a patient_id here — they are covered by the 7-year anonymise_aged_triage()
  -- policy and will be purged on schedule.

  -- Anonymise consultation reason (keep status for clinical continuity)
  UPDATE consultations
  SET reason = '[DELETED]'
  WHERE patient_id = p_patient_id;

  -- Anonymise prescription notes
  UPDATE prescriptions
  SET notes = NULL, medications = '[]'::jsonb
  WHERE patient_id = p_patient_id;

  -- Mark consent as withdrawn
  UPDATE consent_records
  SET withdrawn_at = now(), withdrawn_channel = 'admin_deletion'
  WHERE patient_id = p_patient_id AND withdrawn_at IS NULL;

  -- Disable and anonymise the user account
  UPDATE users
  SET
    full_name        = '[DELETED]',
    email            = gen_random_uuid()::text || '@deleted.klinova.internal',
    account_disabled = true
  WHERE id = p_patient_id;

  INSERT INTO audit_logs (user_id, action, resource, record_id, metadata)
  VALUES (
    auth.uid(),
    'PATIENT_DATA_DELETION',
    'users',
    p_patient_id::text,
    jsonb_build_object('deleted_at', now(), 'requested_by', auth.uid())
  );
END;
$$;

GRANT EXECUTE ON FUNCTION delete_patient_data(uuid) TO authenticated;

-- ── Schedule via pg_cron (enable pg_cron extension first) ─────
-- Run in Supabase SQL editor:
--
-- SELECT cron.schedule(
--   'monthly-data-retention',
--   '0 2 1 * *',   -- 2am on 1st of every month
--   $$
--     SELECT anonymise_aged_triage();
--     SELECT purge_aged_audit_logs();
--     SELECT purge_aged_consent();
--   $$
-- );
