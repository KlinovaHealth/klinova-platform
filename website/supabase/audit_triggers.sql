-- ============================================================
-- KLINOVA: DATABASE-LEVEL AUDIT TRIGGERS
-- Fires on every read (via security definer functions) and
-- every write (INSERT/UPDATE/DELETE) on clinical tables.
-- More reliable than app-level logging alone.
-- ============================================================

-- Ensure audit_logs table exists (from audit_logs.sql)
-- This file adds triggers; run audit_logs.sql first.

-- ── Generic audit trigger function ───────────────────────────
CREATE OR REPLACE FUNCTION audit_clinical_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource,
    record_id,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,                          -- INSERT | UPDATE | DELETE
    TG_TABLE_NAME,
    COALESCE(
      (NEW.id)::text,
      (OLD.id)::text
    ),
    jsonb_build_object(
      'schema',     TG_TABLE_SCHEMA,
      'op',         TG_OP,
      -- For UPDATE: capture which columns changed (not the values — no PHI in audit metadata)
      'changed_cols', CASE WHEN TG_OP = 'UPDATE' THEN
        (SELECT jsonb_agg(key)
         FROM jsonb_each(to_jsonb(NEW))
         WHERE to_jsonb(NEW)->key IS DISTINCT FROM to_jsonb(OLD)->key)
      ELSE NULL END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ── Attach to clinical tables ─────────────────────────────────
DROP TRIGGER IF EXISTS audit_consultations ON consultations;
CREATE TRIGGER audit_consultations
  AFTER INSERT OR UPDATE OR DELETE ON consultations
  FOR EACH ROW EXECUTE FUNCTION audit_clinical_change();

DROP TRIGGER IF EXISTS audit_prescriptions ON prescriptions;
CREATE TRIGGER audit_prescriptions
  AFTER INSERT OR UPDATE OR DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION audit_clinical_change();

DROP TRIGGER IF EXISTS audit_whatsapp_triage ON whatsapp_triage;
CREATE TRIGGER audit_whatsapp_triage
  AFTER INSERT OR UPDATE OR DELETE ON whatsapp_triage
  FOR EACH ROW EXECUTE FUNCTION audit_clinical_change();

DROP TRIGGER IF EXISTS audit_users_role ON users;
CREATE TRIGGER audit_users_role
  AFTER UPDATE OF role, account_disabled ON users
  FOR EACH ROW EXECUTE FUNCTION audit_clinical_change();

DROP TRIGGER IF EXISTS audit_consent ON consent_records;
CREATE TRIGGER audit_consent
  AFTER INSERT OR UPDATE ON consent_records
  FOR EACH ROW EXECUTE FUNCTION audit_clinical_change();

-- ── Break-glass access log ────────────────────────────────────
-- Admin accessing a record is logged with 'ADMIN_ACCESS' action.
CREATE OR REPLACE FUNCTION log_admin_access(
  p_resource  text,
  p_record_id text,
  p_reason    text DEFAULT 'administrative'
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  -- Only admins/owners can call this
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO audit_logs (user_id, action, resource, record_id, metadata)
  VALUES (
    auth.uid(),
    'ADMIN_ACCESS',
    p_resource,
    p_record_id,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION log_admin_access(text, text, text) TO authenticated;

-- ── Audit log query helpers (owner/admin only) ────────────────
CREATE OR REPLACE FUNCTION get_audit_log(
  p_resource  text DEFAULT NULL,
  p_user_id   uuid DEFAULT NULL,
  p_from      timestamptz DEFAULT now() - interval '7 days',
  p_limit     int DEFAULT 100
)
RETURNS TABLE (
  id         uuid,
  user_id    uuid,
  action     text,
  resource   text,
  record_id  text,
  metadata   jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT a.id, a.user_id, a.action, a.resource, a.record_id, a.metadata, a.created_at
  FROM audit_logs a
  WHERE (p_resource IS NULL OR a.resource = p_resource)
    AND (p_user_id  IS NULL OR a.user_id  = p_user_id)
    AND a.created_at >= p_from
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION get_audit_log(text, uuid, timestamptz, int) TO authenticated;
