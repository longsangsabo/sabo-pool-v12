-- =====================================================
-- 🚀 QUICK FIX: TEMPORARILY DISABLE NOTIFICATION TRIGGERS
-- =====================================================

-- 1. Disable the notification trigger temporarily
DROP TRIGGER IF EXISTS challenge_created_notification_trigger ON challenges;

-- 2. Create a safer version that checks for user existence first
CREATE OR REPLACE FUNCTION safe_trigger_challenge_created_notification()
RETURNS TRIGGER AS $$
DECLARE
  challenger_exists BOOLEAN;
  opponent_exists BOOLEAN;
BEGIN
  -- Check if challenger exists in profiles table
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = NEW.challenger_id) INTO challenger_exists;
  
  IF NOT challenger_exists THEN
    RAISE NOTICE 'Skipping notification: Challenger % not found in profiles', NEW.challenger_id;
    RETURN NEW;
  END IF;
  
  -- Check if opponent exists (if specified)
  IF NEW.opponent_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = NEW.opponent_id) INTO opponent_exists;
    
    IF NOT opponent_exists THEN
      RAISE NOTICE 'Skipping notification: Opponent % not found in profiles', NEW.opponent_id;
      RETURN NEW;
    END IF;
  END IF;
  
  -- Only create notifications if both users exist
  -- For now, we'll skip notification creation to avoid errors
  RAISE NOTICE 'Challenge created successfully without notifications: %', NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a safer trigger (optional - we can enable later)
-- CREATE TRIGGER safe_challenge_created_notification_trigger
--   AFTER INSERT ON challenges
--   FOR EACH ROW EXECUTE FUNCTION safe_trigger_challenge_created_notification();

-- 4. Show current triggers on challenges table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'challenges' 
AND trigger_schema = 'public';
