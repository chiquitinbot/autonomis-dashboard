-- Tabla para mensajes del chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL, -- 'all' for broadcast, agent name for direct
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat', -- 'chat', 'broadcast', 'system'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
