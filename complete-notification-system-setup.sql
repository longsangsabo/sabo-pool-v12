-- =====================================================
-- 🔔 COMPLETE NOTIFICATION SYSTEM SETUP
-- =====================================================
-- This script creates the complete notification system including:
-- 1. Functions and triggers for challenge creation
-- 2. Functions and triggers for challenge acceptance  
-- 3. Fix FK constraints
-- 4. RLS policies

-- 1. First ensure table exists with correct structure
CREATE TABLE IF NOT EXISTS challenge_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core notification data
  type VARCHAR(50) NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,  -- Will fix FK constraint below
  
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

-- 2. Fix FK constraint (this is critical!)
-- Drop existing constraints first
ALTER TABLE challenge_notifications DROP CONSTRAINT IF EXISTS challenge_notifications_user_id_fkey;
ALTER TABLE challenge_notifications DROP CONSTRAINT IF EXISTS fk_challenge_notifications_user_id;
ALTER TABLE challenge_notifications DROP CONSTRAINT IF EXISTS fk_challenge_notifications_profiles;

-- Add correct FK constraint (user_id -> profiles.user_id, NOT profiles.id)
ALTER TABLE challenge_notifications 
ADD CONSTRAINT challenge_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenge_notifications_user_id 
  ON challenge_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_notifications_challenge_id 
  ON challenge_notifications(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_notifications_unread 
  ON challenge_notifications(user_id, is_read) 
  WHERE is_read = false;

-- 4. Enable RLS
ALTER TABLE challenge_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON challenge_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON challenge_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON challenge_notifications;

CREATE POLICY "Users can view their own notifications" 
  ON challenge_notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
  ON challenge_notifications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON challenge_notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- 6. Drop any existing versions of the function to avoid conflicts
DROP FUNCTION IF EXISTS create_challenge_notification CASCADE;
DROP FUNCTION IF EXISTS create_challenge_notification(TEXT, UUID, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ) CASCADE;
DROP FUNCTION IF EXISTS create_challenge_notification(TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_challenge_notification(TEXT, UUID, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT) CASCADE;

-- Create the definitive notification function
CREATE OR REPLACE FUNCTION create_challenge_notification(
  p_type TEXT,
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_challenge_id UUID DEFAULT NULL,
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

-- 7. Drop existing trigger functions to avoid conflicts
DROP FUNCTION IF EXISTS trigger_challenge_created_notification CASCADE;
DROP FUNCTION IF EXISTS trigger_challenge_status_changed CASCADE;

-- Create trigger function for challenge creation
CREATE OR REPLACE FUNCTION trigger_challenge_created_notification()
RETURNS TRIGGER AS $$
DECLARE
  challenger_profile RECORD;
  opponent_profile RECORD;
BEGIN
  -- Get challenger profile
  SELECT full_name INTO challenger_profile 
  FROM profiles WHERE user_id = NEW.challenger_id;
  
  -- Only notify challenger for challenge creation (not opponent yet)
  PERFORM create_challenge_notification(
    'challenge_created',
    NEW.challenger_id,
    '🏆 Thách đấu được tạo thành công',
    CASE 
      WHEN NEW.opponent_id IS NULL THEN 'Bạn đã tạo thách đấu mở. Chờ đối thủ tham gia!'
      ELSE 'Bạn đã tạo thách đấu. Chờ đối thủ phản hồi!'
    END,
    NEW.id,
    'trophy',
    'medium'
  );
  
  -- If specific opponent, notify them about receiving challenge
  IF NEW.opponent_id IS NOT NULL THEN
    SELECT full_name INTO opponent_profile 
    FROM profiles WHERE user_id = NEW.opponent_id;
    
    PERFORM create_challenge_notification(
      'challenge_received',
      NEW.opponent_id,
      '⚔️ Có thách đấu mới!',
      COALESCE(challenger_profile.full_name, 'Ai đó') || ' đã thách đấu bạn',
      NEW.id,
      'sword',
      'high',
      'Xem chi tiết',
      '/challenges/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger function for challenge status changes (CRITICAL!)
CREATE OR REPLACE FUNCTION trigger_challenge_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  challenger_profile RECORD;
  opponent_profile RECORD;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get profiles
  SELECT full_name INTO challenger_profile 
  FROM profiles WHERE user_id = NEW.challenger_id;
  
  SELECT full_name INTO opponent_profile 
  FROM profiles WHERE user_id = NEW.opponent_id;
  
  -- Handle challenge acceptance
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Notify challenger that challenge was accepted
    PERFORM create_challenge_notification(
      'challenge_accepted',
      NEW.challenger_id,
      '🎉 Challenge Accepted!',
      COALESCE(opponent_profile.full_name, 'Đối thủ') || ' đã chấp nhận thách đấu của bạn!',
      NEW.id,
      'check-circle',
      'high',
      'Xem trận đấu',
      '/challenges/' || NEW.id
    );
    
    -- Notify opponent that they joined successfully  
    PERFORM create_challenge_notification(
      'challenge_joined',
      NEW.opponent_id,
      '⚔️ Tham gia thành công!',
      'Bạn đã tham gia thách đấu của ' || COALESCE(challenger_profile.full_name, 'đối thủ') || '!',
      NEW.id,
      'play-circle',
      'medium',
      'Xem trận đấu', 
      '/challenges/' || NEW.id
    );
  END IF;
  
  -- Handle challenge declined
  IF NEW.status = 'declined' AND OLD.status != 'declined' THEN
    PERFORM create_challenge_notification(
      'challenge_declined',
      NEW.challenger_id,
      '❌ Thách đấu bị từ chối',
      COALESCE(opponent_profile.full_name, 'Đối thủ') || ' đã từ chối thách đấu của bạn.',
      NEW.id,
      'x-circle',
      'medium',
      'Xem chi tiết',
      '/challenges/' || NEW.id
    );
  END IF;
  
  -- Handle open challenge acceptance (when opponent_id changes from NULL)
  IF OLD.opponent_id IS NULL AND NEW.opponent_id IS NOT NULL AND NEW.status = 'accepted' THEN
    PERFORM create_challenge_notification(
      'open_challenge_joined',
      NEW.challenger_id,
      '🎉 Có người tham gia!',
      COALESCE(opponent_profile.full_name, 'Ai đó') || ' đã tham gia thách đấu mở của bạn!',
      NEW.id,
      'user-plus',
      'high',
      'Xem trận đấu',
      '/challenges/' || NEW.id
    );
    
    PERFORM create_challenge_notification(
      'open_challenge_joined_confirm',
      NEW.opponent_id,
      '⚔️ Tham gia thành công!',
      'Bạn đã tham gia thách đấu của ' || COALESCE(challenger_profile.full_name, 'đối thủ') || '!',
      NEW.id,
      'play-circle',
      'medium',
      'Xem trận đấu',
      '/challenges/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers
DROP TRIGGER IF EXISTS challenge_created_notification_trigger ON challenges;
DROP TRIGGER IF EXISTS challenge_status_changed_notification_trigger ON challenges;

CREATE TRIGGER challenge_created_notification_trigger
  AFTER INSERT ON challenges
  FOR EACH ROW EXECUTE FUNCTION trigger_challenge_created_notification();

CREATE TRIGGER challenge_status_changed_notification_trigger
  AFTER UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION trigger_challenge_status_changed();

-- 10. Grant permissions
GRANT SELECT, UPDATE ON challenge_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_challenge_notification TO authenticated;

-- 11. Test the setup
DO $$
DECLARE
    test_user_id UUID;
    test_notif_id UUID;
BEGIN
    -- Get a valid user_id from profiles
    SELECT user_id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test notification creation
        SELECT create_challenge_notification(
            'setup_test',
            NULL,
            test_user_id,
            '✅ Notification System Ready',
            'Hệ thống thông báo đã được cài đặt thành công!',
            'check-circle',
            'medium'
        ) INTO test_notif_id;
        
        -- Clean up test notification
        DELETE FROM challenge_notifications 
        WHERE id = test_notif_id;
        
        RAISE NOTICE '✅ Notification system setup SUCCESSFUL!';
        RAISE NOTICE 'ℹ️  Functions, triggers, and policies are ready';
        RAISE NOTICE '🎯 Users will now receive notifications when challenges are accepted';
    ELSE
        RAISE NOTICE '❌ No users found in profiles table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Setup failed: %', SQLERRM;
END $$;
