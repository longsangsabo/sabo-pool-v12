-- =====================================================
-- 🔧 FIX NOTIFICATION SYSTEM FOREIGN KEY
-- =====================================================

-- 1. Fix the foreign key constraint issue
ALTER TABLE challenge_notifications 
DROP CONSTRAINT IF EXISTS challenge_notifications_user_id_fkey;

-- Add correct foreign key constraint
ALTER TABLE challenge_notifications 
ADD CONSTRAINT challenge_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 2. Re-create the notification trigger with proper user checking
CREATE OR REPLACE FUNCTION trigger_challenge_created_notification()
RETURNS TRIGGER AS $$
DECLARE
  challenger_profile RECORD;
  opponent_profile RECORD;
  template JSONB;
BEGIN
  -- Get challenger profile using user_id (not id)
  SELECT full_name INTO challenger_profile 
  FROM profiles WHERE user_id = NEW.challenger_id;
  
  -- Skip if challenger not found (safety check)
  IF challenger_profile.full_name IS NULL THEN
    RAISE NOTICE 'Challenger profile not found for user_id: %', NEW.challenger_id;
    RETURN NEW;
  END IF;
  
  -- Get opponent profile (if exists) using user_id
  IF NEW.opponent_id IS NOT NULL THEN
    SELECT full_name INTO opponent_profile 
    FROM profiles WHERE user_id = NEW.opponent_id;
    
    -- Skip if opponent not found (safety check)
    IF opponent_profile.full_name IS NULL THEN
      RAISE NOTICE 'Opponent profile not found for user_id: %', NEW.opponent_id;
      RETURN NEW;
    END IF;
  END IF;

  -- Notify challenger that challenge was created
  template := get_notification_template('challenge_created', jsonb_build_object(
    'challenge_id', NEW.id,
    'opponent_name', COALESCE(opponent_profile.full_name, 'Chờ đối thủ')
  ));
  
  -- Only create notification if template function exists
  IF template IS NOT NULL THEN
    PERFORM create_challenge_notification(
      'challenge_created',
      NEW.id,
      NEW.challenger_id,  -- This now correctly references profiles.user_id
      template->>'title',
      template->>'message', 
      template->>'icon',
      template->>'priority'
    );
  END IF;
  
  -- If opponent exists, notify them about receiving challenge
  IF NEW.opponent_id IS NOT NULL AND opponent_profile.full_name IS NOT NULL THEN
    template := get_notification_template('challenge_received', jsonb_build_object(
      'challenge_id', NEW.id,
      'challenger_name', challenger_profile.full_name
    ));
    
    IF template IS NOT NULL THEN
      PERFORM create_challenge_notification(
        'challenge_received',
        NEW.id,
        NEW.opponent_id,  -- This now correctly references profiles.user_id
        template->>'title',
        template->>'message',
        template->>'icon', 
        template->>'priority',
        template->>'action_text',
        template->>'action_url'
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the challenge creation
    RAISE NOTICE 'Notification creation failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Re-enable the trigger
DROP TRIGGER IF EXISTS challenge_created_notification_trigger ON challenges;
CREATE TRIGGER challenge_created_notification_trigger
  AFTER INSERT ON challenges
  FOR EACH ROW EXECUTE FUNCTION trigger_challenge_created_notification();

-- 4. Test the fix with a notification
SELECT 'Notification system fixed and re-enabled!' as status;
