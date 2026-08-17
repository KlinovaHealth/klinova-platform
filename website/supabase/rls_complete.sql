-- ============================================================
-- KLINOVA: COMPREHENSIVE DENY-BY-DEFAULT RLS
-- Schema-verified against actual production tables.
-- Uses SECURITY DEFINER helper to avoid infinite recursion
-- when policies on `users` reference the `users` table.
-- ============================================================

-- ── Role helper (bypasses RLS to avoid infinite recursion) ───
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- ── users ────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users FOR SELECT USING (
  id = auth.uid()
  OR current_user_role() IN ('admin', 'owner', 'support')
  -- Doctor can see patients assigned via consultations
  OR (
    current_user_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consultations c
        WHERE c.doctor_id = auth.uid() AND c.patient_id = users.id
    )
  )
  -- Pharmacist can see patients with prescriptions for their pharmacy
  OR (
    current_user_role() = 'pharmacist'
    AND EXISTS (
      SELECT 1 FROM prescriptions p
        JOIN users caller ON caller.id = auth.uid()
          WHERE p.patient_id = users.id
            AND p.pharmacy_id = caller.pharmacy_id
    )
  )
);

DROP POLICY IF EXISTS "users_update_self" ON users;
CREATE POLICY "users_update_self" ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = current_user_role()
  );

DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users FOR UPDATE
  USING (current_user_role() IN ('admin', 'owner'));

-- ── consultations ─────────────────────────────────────────────
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultations_select" ON consultations;
CREATE POLICY "consultations_select" ON consultations FOR SELECT USING (
  patient_id = auth.uid()
  OR doctor_id = auth.uid()
  OR current_user_role() IN ('admin', 'owner', 'support', 'nurse', 'frontdesk')
);

DROP POLICY IF EXISTS "consultations_insert" ON consultations;
CREATE POLICY "consultations_insert" ON consultations FOR INSERT
  WITH CHECK (
    patient_id = auth.uid()
    OR current_user_role() IN ('nurse', 'frontdesk', 'admin', 'owner')
  );

DROP POLICY IF EXISTS "consultations_update" ON consultations;
CREATE POLICY "consultations_update" ON consultations FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR current_user_role() IN ('admin', 'owner', 'nurse')
  );

-- ── prescriptions ─────────────────────────────────────────────
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prescriptions_select" ON prescriptions;
CREATE POLICY "prescriptions_select" ON prescriptions FOR SELECT USING (
  patient_id = auth.uid()
  OR doctor_id = auth.uid()
  -- Pharmacist sees prescriptions for their linked pharmacy
  OR (
    current_user_role() = 'pharmacist'
    AND EXISTS (
      SELECT 1 FROM users caller WHERE caller.id = auth.uid()
        AND caller.pharmacy_id = prescriptions.pharmacy_id
    )
  )
  OR current_user_role() IN ('admin', 'owner', 'nurse')
);

DROP POLICY IF EXISTS "prescriptions_insert" ON prescriptions;
CREATE POLICY "prescriptions_insert" ON prescriptions FOR INSERT
  WITH CHECK (
    doctor_id = auth.uid()
    AND current_user_role() = 'doctor'
  );

DROP POLICY IF EXISTS "prescriptions_update" ON prescriptions;
CREATE POLICY "prescriptions_update" ON prescriptions FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR (
      current_user_role() = 'pharmacist'
      AND EXISTS (
        SELECT 1 FROM users caller WHERE caller.id = auth.uid()
          AND caller.pharmacy_id = prescriptions.pharmacy_id
      )
    )
    OR current_user_role() IN ('admin', 'owner')
  );

-- ── whatsapp_triage ───────────────────────────────────────────
ALTER TABLE whatsapp_triage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctors can view triage" ON whatsapp_triage;
DROP POLICY IF EXISTS "triage_clinical_select" ON whatsapp_triage;

CREATE POLICY "triage_clinical_select" ON whatsapp_triage FOR SELECT USING (
  current_user_role() IN ('doctor', 'nurse', 'admin', 'owner')
);

-- ── pharmacies ────────────────────────────────────────────────
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pharmacies_public_select" ON pharmacies;
CREATE POLICY "pharmacies_public_select" ON pharmacies FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "pharmacies_admin_all" ON pharmacies;
CREATE POLICY "pharmacies_admin_all" ON pharmacies FOR ALL
  USING (current_user_role() IN ('admin', 'owner'));
