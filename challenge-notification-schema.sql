-- =====================================================
-- 🏆 CHALLENGE NOTIFICATION SYSTEM DATABASE SCHEMA
-- =====================================================

-- 1. Create challenge_notifications table
CREATE TABLE IF NOT EXISTS challenge_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core notification data
  type VARCHAR(50) NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_text TEXT,
  action_url TEXT,
  icon TEXT NOT NULL DEFAULT 'bell',
  
  -- Priority and status
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Additional data
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenge_notifications_user_id 
  ON challenge_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_notifications_challenge_id 
  ON challenge_notifications(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_notifications_scheduled 
  ON challenge_notifications(scheduled_for) 
  WHERE scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_challenge_notifications_unread 
  ON challenge_notifications(user_id, is_read) 
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_challenge_notifications_type 
  ON challenge_notifications(type);

CREATE INDEX IF NOT EXISTS idx_challenge_notifications_priority 
  ON challenge_notifications(priority, created_at DESC);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE challenge_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can view their own notifications" 
  ON challenge_notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
  ON challenge_notifications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON challenge_notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- 5. Create notification types enum (for validation)
CREATE TYPE challenge_notification_type AS ENUM (
  -- Creation & Setup
  'challenge_created',
  'challenge_received', 
  'challenge_accepted',
  'challenge_declined',
  'schedule_confirmed',
  
  -- Pre-match
  'match_reminder_24h',
  'match_reminder_1h', 
  'match_reminder_15m',
  'check_in_required',
  'opponent_checked_in',
  
  -- Match
  'match_started',
  'score_updated',
  'dispute_raised',
  'timeout_called',
  
  -- Post-match
  'result_submitted',
  'result_disputed',
  'result_confirmed', 
  'club_review_pending',
  'club_approved',
  'spa_points_awarded',
  'elo_updated',
  'achievement_unlocked',
  
  -- Social
  'match_shared',
  'rematch_requested',
  'review_received'
);

-- 6. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_challenge_notifications_updated_at
  BEFORE UPDATE ON challenge_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Create notification summary view for quick stats
CREATE OR REPLACE VIEW challenge_notification_stats AS
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = false) as unread_count,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count,
  MAX(created_at) as last_notification_at
FROM challenge_notifications
GROUP BY user_id;

-- 8. Create function to automatically create notifications for challenge events
CREATE OR REPLACE FUNCTION create_challenge_notification(
  p_type TEXT,
  p_challenge_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_icon TEXT DEFAULT 'bell',
  p_priority TEXT DEFAULT 'medium',
  p_action_text TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_scheduled_for TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO challenge_notifications (
    type, challenge_id, user_id, title, message, icon, 
    priority, action_text, action_url, metadata, scheduled_for
  )
  VALUES (
    p_type, p_challenge_id, p_user_id, p_title, p_message, p_icon,
    p_priority, p_action_text, p_action_url, p_metadata, p_scheduled_for
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT SELECT, UPDATE ON challenge_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_challenge_notification TO authenticated;
GRANT SELECT ON challenge_notification_stats TO authenticated;

-- 10. Sample notification templates as database function
CREATE OR REPLACE FUNCTION get_notification_template(
  template_type TEXT,
  challenge_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE template_type
    WHEN 'challenge_created' THEN jsonb_build_object(
      'title', '🏆 Thách đấu được tạo thành công',
      'message', 'Bạn đã tạo thách đấu với ' || COALESCE(challenge_data->>'opponent_name', 'đối thủ'),
      'icon', 'trophy',
      'priority', 'medium'
    )
    WHEN 'challenge_received' THEN jsonb_build_object(
      'title', '⚔️ Có thách đấu mới!', 
      'message', COALESCE(challenge_data->>'challenger_name', 'Ai đó') || ' đã thách đấu bạn',
      'icon', 'sword',
      'priority', 'high',
      'action_text', 'Xem chi tiết',
      'action_url', '/challenges/' || COALESCE(challenge_data->>'challenge_id', '')
    )
    WHEN 'match_reminder_1h' THEN jsonb_build_object(
      'title', '⏰ Sắp đến giờ thi đấu',
      'message', 'Trận đấu với ' || COALESCE(challenge_data->>'opponent_name', 'đối thủ') || ' sẽ bắt đầu trong 1 giờ',
      'icon', 'clock',
      'priority', 'high',
      'action_text', 'Chuẩn bị',
      'action_url', '/challenges/' || COALESCE(challenge_data->>'challenge_id', '') || '/prepare'
    )
    WHEN 'spa_points_awarded' THEN jsonb_build_object(
      'title', '🎁 Nhận SPA Points',
      'message', 'Bạn đã nhận ' || COALESCE(challenge_data->>'spa_points', '0') || ' SPA Points từ trận thắng!',
      'icon', 'gift',
      'priority', 'medium'
    )
    ELSE jsonb_build_object(
      'title', 'Thông báo thách đấu',
      'message', 'Có hoạt động mới trong thách đấu của bạn',
      'icon', 'bell',
      'priority', 'medium'
    )
  END;
END;
$$ LANGUAGE plpgsql;

-- 11. Create automatic notification triggers
-- Trigger for when challenge is created
CREATE OR REPLACE FUNCTION trigger_challenge_created_notification()
RETURNS TRIGGER AS $$
DECLARE
  challenger_profile RECORD;
  opponent_profile RECORD;
  template JSONB;
BEGIN
  -- Get challenger profile
  SELECT full_name INTO challenger_profile 
  FROM profiles WHERE user_id = NEW.challenger_id;
  
  -- Get opponent profile (if exists)
  IF NEW.opponent_id IS NOT NULL THEN
    SELECT full_name INTO opponent_profile 
    FROM profiles WHERE user_id = NEW.opponent_id;
  END IF;

  -- Notify challenger that challenge was created
  template := get_notification_template('challenge_created', jsonb_build_object(
    'challenge_id', NEW.id,
    'opponent_name', COALESCE(opponent_profile.full_name, 'Chờ đối thủ')
  ));
  
  PERFORM create_challenge_notification(
    'challenge_created',
    NEW.id,
    NEW.challenger_id,
    template->>'title',
    template->>'message', 
    template->>'icon',
    template->>'priority'
  );
  
  -- If opponent exists, notify them about receiving challenge
  IF NEW.opponent_id IS NOT NULL THEN
    template := get_notification_template('challenge_received', jsonb_build_object(
      'challenge_id', NEW.id,
      'challenger_name', challenger_profile.full_name
    ));
    
    PERFORM create_challenge_notification(
      'challenge_received',
      NEW.id,
      NEW.opponent_id,
      template->>'title',
      template->>'message',
      template->>'icon', 
      template->>'priority',
      template->>'action_text',
      template->>'action_url'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER challenge_created_notification_trigger
  AFTER INSERT ON challenges
  FOR EACH ROW EXECUTE FUNCTION trigger_challenge_created_notification();

-- 12. Sample data for testing (optional)
-- INSERT INTO challenge_notifications (
--   type, user_id, title, message, icon, priority, metadata
-- ) VALUES (
--   'test_notification',
--   auth.uid(),
--   '🧪 Test Notification',
--   'This is a test notification for the challenge system',
--   'test-tube',
--   'medium',
--   '{"test": true}'::jsonb
-- );

COMMIT;
