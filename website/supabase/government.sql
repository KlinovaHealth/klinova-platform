-- Government subscription flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS gov_subscribed boolean DEFAULT false;

-- Account enable/disable flag (owner or admin with permission can toggle)
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_disabled boolean DEFAULT false;

-- Admin permission: owner can grant this to allow admin to manage accounts
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_manage_accounts boolean DEFAULT false;

-- RLS: government users can read whatsapp_triage (for map and stats)
CREATE POLICY IF NOT EXISTS "government_can_read_triage"
  ON whatsapp_triage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('government', 'owner', 'admin')
        AND (users.role != 'government' OR users.gov_subscribed = true)
    )
  );
