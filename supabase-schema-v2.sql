-- =============================================
-- AUTONOMIS DASHBOARD - SCHEMA V2
-- New tables for Bernardo's goals tracking
-- =============================================

-- =============================================
-- 1. EXPENSES TRACKING
-- =============================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('comida', 'entretenimiento', 'transporte', 'compras', 'servicios', 'otros')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'tarjeta',
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- =============================================
-- 2. FITNESS TRACKING (Half Marathon Goal)
-- =============================================
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gym', 'run', 'yoga', 'other')),
  duration_minutes INTEGER,
  distance_km DECIMAL(5,2),
  calories INTEGER,
  notes TEXT,
  strava_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fitness_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'weekly_km', 'weekly_gym_days', 'race'
  target_value DECIMAL(10,2),
  target_date DATE,
  current_value DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Bernardo's half marathon goal
INSERT INTO fitness_goals (name, target_type, target_value, target_date) VALUES
('Medio Maratón 2026', 'race', 21.1, '2026-12-31'),
('Gym 4x/semana', 'weekly_gym_days', 4, NULL);

CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workouts_type ON workouts(type);

-- =============================================
-- 3. BITCOIN GOAL TRACKING
-- =============================================
CREATE TABLE crypto_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  purchase_price_usd DECIMAL(18,2),
  purchase_date DATE,
  exchange TEXT DEFAULT 'bitso',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE crypto_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  target_amount DECIMAL(18,8) NOT NULL,
  current_amount DECIMAL(18,8) DEFAULT 0,
  target_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Bernardo's Bitcoin goal
INSERT INTO crypto_goals (symbol, target_amount, current_amount, target_date) VALUES
('BTC', 1.0, 0.2, '2026-12-31');

CREATE TABLE crypto_price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('below', 'above', 'percent_drop', 'percent_rise')),
  threshold_value DECIMAL(18,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default BTC alerts
INSERT INTO crypto_price_alerts (symbol, alert_type, threshold_value) VALUES
('BTC', 'below', 85000),
('BTC', 'percent_drop', 5);

-- =============================================
-- 4. PARTNERSHIP PIPELINE (CRM)
-- =============================================
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'mlops', 'observability', 'governance', 'vector_db', 'llm_infra'
  website TEXT,
  partner_program_url TEXT,
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'contacted', 'in_progress', 'active', 'inactive')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  next_step TEXT,
  next_step_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE partner_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  linkedin_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE partner_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES partner_contacts(id),
  type TEXT NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'linkedin', 'other')),
  date DATE NOT NULL,
  summary TEXT,
  outcome TEXT,
  next_step TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial partners
INSERT INTO partners (name, category, website, status, priority, next_step) VALUES
('Arize AI', 'observability', 'https://arize.com', 'prospect', 'high', 'Find partnership contact on LinkedIn'),
('Weights & Biases', 'mlops', 'https://wandb.ai', 'prospect', 'high', 'Research partner program requirements'),
('HashiCorp', 'infrastructure', 'https://hashicorp.com', 'active', 'high', 'Maintain relationship'),
('IBM', 'enterprise', 'https://ibm.com', 'active', 'high', 'Follow up with Jason Simons');

CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_category ON partners(category);

-- =============================================
-- 5. ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE workouts;
ALTER PUBLICATION supabase_realtime ADD TABLE fitness_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE crypto_holdings;
ALTER PUBLICATION supabase_realtime ADD TABLE crypto_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE partners;
ALTER PUBLICATION supabase_realtime ADD TABLE partner_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE partner_interactions;

-- =============================================
-- 6. ROW LEVEL SECURITY
-- =============================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_interactions ENABLE ROW LEVEL SECURITY;

-- Allow all for now (single user)
CREATE POLICY "Allow all" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all" ON workouts FOR ALL USING (true);
CREATE POLICY "Allow all" ON fitness_goals FOR ALL USING (true);
CREATE POLICY "Allow all" ON crypto_holdings FOR ALL USING (true);
CREATE POLICY "Allow all" ON crypto_goals FOR ALL USING (true);
CREATE POLICY "Allow all" ON crypto_price_alerts FOR ALL USING (true);
CREATE POLICY "Allow all" ON partners FOR ALL USING (true);
CREATE POLICY "Allow all" ON partner_contacts FOR ALL USING (true);
CREATE POLICY "Allow all" ON partner_interactions FOR ALL USING (true);
