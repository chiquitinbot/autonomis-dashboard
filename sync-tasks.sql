-- =============================================
-- SYNC MISSION CONTROL → SUPABASE DASHBOARD
-- Run this in Supabase SQL Editor
-- =============================================

-- Delete old MONEY tasks (from the $1M mission)
DELETE FROM comments WHERE ticket_id LIKE 'MONEY-%';
DELETE FROM tickets WHERE id LIKE 'MONEY-%';

-- Insert current Mission Control tasks
INSERT INTO tickets (id, title, description, status, priority, assignee, labels) VALUES

-- Partnership & Business Development
('MC-001', 'Partnership Research System', 
 'Sistema de prospecting de AI partners para replicar modelo HashiCorp. Investigar MLOps, Observability, Governance partners. Prospectos: Arize AI, Weights & Biases.',
 'in-progress', 'high', 'Apollo, Chiquitín', 
 ARRAY['partnerships', 'sales', 'ai']),

('MC-002', 'Contact Arize AI Partnerships',
 'Buscar VP de Partnerships de Arize AI en LinkedIn. Preparar pitch de Nexaminds como system integrator.',
 'todo', 'high', 'Chiquitín',
 ARRAY['partnerships', 'arize']),

('MC-003', 'Research Weights & Biases Partner Program',
 'Investigar requisitos del programa de partners de W&B. Ver certificaciones disponibles.',
 'todo', 'high', 'Apollo',
 ARRAY['partnerships', 'wandb']),

-- Personal Goals
('GOAL-001', 'BTC Goal: 0.2 → 1.0 BTC',
 'Meta 2026: Acumular 1 Bitcoin completo. Actual: 0.2 BTC. Exchange: Bitso. Alertas configuradas para dips >5%.',
 'in-progress', 'medium', 'Chiquitín',
 ARRAY['personal', 'crypto', 'goals']),

('GOAL-002', 'Half Marathon Training',
 'Meta 2026: Correr un medio maratón (21K). Gym 4x/semana, aumentar km gradualmente. App: Strava.',
 'in-progress', 'medium', 'Chiquitín',
 ARRAY['personal', 'fitness', 'goals']),

-- Infrastructure & Automation
('AUTO-001', 'Email Classifier',
 'Clasificación automática de emails cada 10 min usando Gemini. Labels: Nexaminds, Meetings, Sales, Partners, etc.',
 'done', 'high', 'Classifier',
 ARRAY['automation', 'email']),

('AUTO-002', 'Daily Morning Briefing',
 'Briefing automático Lun-Vie 8AM con: agenda del día, emails pendientes, precio BTC.',
 'done', 'medium', 'Chiquitín',
 ARRAY['automation', 'briefing']),

('AUTO-003', 'Expense Tracker',
 'Google Sheet para tracking de gastos. Organizado por mes con fórmulas de resumen automáticas.',
 'done', 'medium', 'Chiquitín',
 ARRAY['automation', 'finance']),

-- Dashboard
('DASH-001', 'Dashboard Widgets v2',
 'Widgets nuevos: BitcoinTracker, FitnessTracker, ExpensesTracker, PartnershipPipeline. Desplegado en Vercel.',
 'done', 'high', 'Chiquitín',
 ARRAY['dashboard', 'frontend']);

-- Add initial comments
INSERT INTO comments (ticket_id, author, content) VALUES
('MC-001', 'Chiquitín', 'Apollo activado para research. Cron job Lun/Jue 2PM.'),
('MC-001', 'Apollo', 'Primeros prospectos identificados: Arize AI (Observability), W&B (MLOps).'),
('GOAL-001', 'Chiquitín', 'Alertas de precio configuradas: >5% drop o <$85K.'),
('GOAL-002', 'Chiquitín', 'Gym reminder configurado Lun-Vie 2PM.'),
('AUTO-001', 'Classifier', 'Corriendo cada 10 min. Usando Gemini para clasificación.'),
('DASH-001', 'Chiquitín', 'Live en dashboard.autonomis.co 🚀');
