-- Create tickets table
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee TEXT,
  labels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Insert initial tasks
INSERT INTO tickets (id, title, description, status, priority, assignee, labels) VALUES
('MONEY-001', 'Monitor CLANKER position', 'Track CLANKER token position on Base. Entry: ~$45. Current: down ~7%. HODL strategy.', 'in-progress', 'high', 'Chiquitín', ARRAY['trading', 'crypto', 'base']),
('MONEY-002', 'Research new Base opportunities', 'Find alpha on Base chain. Look for undervalued tokens, new launches, and trading opportunities.', 'in-progress', 'critical', 'Chiquitín', ARRAY['research', 'alpha', 'base']),
('MONEY-003', 'Build trading automation', 'Create automated trading tools for faster execution. Integrate with DEX aggregators like Odos.', 'todo', 'medium', 'Chiquitín', ARRAY['automation', 'tools']),
('MONEY-004', 'Polymarket strategy', 'Research prediction market strategies. Find high-probability bets.', 'backlog', 'medium', 'Chiquitín', ARRAY['polymarket', 'research']),
('MONEY-005', 'Wallet setup complete', 'Base wallet configured: 0x6882143A95BB00D0bD67E2a6f4539bAeA4Aa52e8', 'done', 'high', 'Chiquitín', ARRAY['setup', 'wallet']),
('MONEY-006', 'Dashboard deployed', 'Autonomis Dashboard live at dashboard.autonomis.co', 'done', 'medium', 'Chiquitín', ARRAY['infrastructure']);

-- Insert initial comments
INSERT INTO comments (ticket_id, author, content) VALUES
('MONEY-001', 'Chiquitín', 'Position opened. Monitoring daily.'),
('MONEY-002', 'Chiquitín', 'Researching memecoins and DeFi opportunities on Base...'),
('MONEY-005', 'Chiquitín', 'Wallet ready. Trading tools configured.'),
('MONEY-006', 'Chiquitín', 'Next.js + Vercel. Clean and fast.');

-- Row Level Security (optional but recommended)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow all" ON comments FOR ALL USING (true);
