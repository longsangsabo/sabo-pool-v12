-- =====================================================
-- 🔔 SIMPLE NOTIFICATION SYSTEM FOR CHALLENGES
-- =====================================================

-- 1. Create simple notifications table
CREATE TABLE IF NOT EXISTS simple_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic notification info
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Challenge reference
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_simple_notifications_user_id 
  ON simple_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_simple_notifications_unread 
  ON simple_notifications(user_id, is_read) 
  WHERE is_read = false;

-- 3. Create function to send notification
CREATE OR REPLACE FUNCTION send_simple_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_challenge_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO simple_notifications (
    user_id, type, title, message, challenge_id
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_challenge_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to mark as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE simple_notifications 
  SET is_read = true 
  WHERE id = p_notification_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to get unread count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM simple_notifications 
    WHERE user_id = p_user_id AND is_read = false
  );
END;
$$ LANGUAGE plpgsql;
