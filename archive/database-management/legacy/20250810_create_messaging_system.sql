-- Create messaging system tables
-- Migration: 20250810_create_messaging_system

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  thread_id UUID,
  subject TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'direct' CHECK (message_type IN ('direct', 'system', 'tournament', 'announcement')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message threads table
CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  last_message_id UUID,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread participants table
CREATE TABLE IF NOT EXISTS thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  UNIQUE(thread_id, user_id)
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  tournament_updates BOOLEAN DEFAULT TRUE,
  direct_messages BOOLEAN DEFAULT TRUE,
  system_announcements BOOLEAN DEFAULT TRUE,
  match_reminders BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_status ON messages(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user ON thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_activity ON message_threads(last_activity DESC);

-- Add foreign key for thread_id in messages
ALTER TABLE messages ADD CONSTRAINT fk_messages_thread 
  FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE SET NULL;

-- Add foreign key for last_message_id in message_threads  
ALTER TABLE message_threads ADD CONSTRAINT fk_threads_last_message
  FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Message threads policies
CREATE POLICY "Users can view threads they participate in" ON message_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM thread_participants 
      WHERE thread_id = message_threads.id 
      AND user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create threads" ON message_threads
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Thread participants policies
CREATE POLICY "Users can view participants in their threads" ON thread_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM thread_participants tp2 
      WHERE tp2.thread_id = thread_participants.thread_id 
      AND tp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join threads" ON thread_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notification settings policies
CREATE POLICY "Users can manage their own notification settings" ON notification_settings
  FOR ALL USING (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages 
    WHERE recipient_id = user_uuid 
    AND status = 'unread'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send system message
CREATE OR REPLACE FUNCTION send_system_message(
  recipient_uuid UUID,
  message_subject TEXT,
  message_content TEXT,
  message_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  message_id UUID;
BEGIN
  INSERT INTO messages (
    sender_id,
    recipient_id,
    subject,
    content,
    message_type,
    metadata
  ) VALUES (
    NULL, -- System message
    recipient_uuid,
    message_subject,
    message_content,
    'system',
    message_metadata
  ) RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default notification settings for existing users
INSERT INTO notification_settings (user_id)
SELECT user_id FROM profiles 
WHERE user_id NOT IN (SELECT user_id FROM notification_settings);
