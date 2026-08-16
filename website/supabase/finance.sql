-- Manual expense & income entries
CREATE TABLE IF NOT EXISTS fin_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  type        text NOT NULL CHECK (type IN ('income','expense')),
  category    text NOT NULL,
  description text,
  amount      numeric(14,2) NOT NULL,
  currency    text DEFAULT 'XOF',
  entry_date  date DEFAULT CURRENT_DATE,
  notes       text,
  created_by  uuid REFERENCES users(id)
);

-- Per-service pricing config (one row per service)
CREATE TABLE IF NOT EXISTS fin_rates (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text UNIQUE NOT NULL,
  rate    numeric(14,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'XOF',
  active  boolean DEFAULT true
);

-- Seed default rates
INSERT INTO fin_rates (service, rate, currency) VALUES
  ('consultation',    5000,  'XOF'),
  ('whatsapp_triage', 1000,  'XOF'),
  ('gov_subscription',50000, 'XOF'),
  ('pharmacy_order',  2000,  'XOF')
ON CONFLICT (service) DO NOTHING;

-- Tax & settings
CREATE TABLE IF NOT EXISTS fin_settings (
  key   text PRIMARY KEY,
  value text NOT NULL
);
INSERT INTO fin_settings (key, value) VALUES
  ('tax_rate',  '27'),
  ('currency',  'XOF')
ON CONFLICT (key) DO NOTHING;

-- Access control: who can view the finance module besides owner
CREATE TABLE IF NOT EXISTS fin_access (
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  granted_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE fin_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_rates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_access   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fin_entries_read" ON fin_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
    OR EXISTS (SELECT 1 FROM fin_access WHERE user_id = auth.uid())
  );
CREATE POLICY "fin_entries_write" ON fin_entries FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
    OR EXISTS (SELECT 1 FROM fin_access WHERE user_id = auth.uid())
  );
CREATE POLICY "fin_entries_delete" ON fin_entries FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
    OR EXISTS (SELECT 1 FROM fin_access WHERE user_id = auth.uid())
  );

CREATE POLICY "fin_rates_read" ON fin_rates FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
    OR EXISTS (SELECT 1 FROM fin_access WHERE user_id = auth.uid())
  );
CREATE POLICY "fin_rates_write" ON fin_rates FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'));

CREATE POLICY "fin_settings_read" ON fin_settings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
    OR EXISTS (SELECT 1 FROM fin_access WHERE user_id = auth.uid())
  );
CREATE POLICY "fin_settings_write" ON fin_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'));

CREATE POLICY "fin_access_all" ON fin_access FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'));
