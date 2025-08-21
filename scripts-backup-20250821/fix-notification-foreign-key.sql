-- =====================================================
-- 🔧 FIX CHALLENGE NOTIFICATION FOREIGN KEY CONSTRAINT
-- =====================================================

-- 1. First, let's check the current foreign key constraint
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    a.attname AS column_name,
    confrelid::regclass AS foreign_table_name,
    af.attname AS foreign_column_name
FROM pg_constraint AS c
JOIN pg_attribute AS a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute AS af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE c.contype = 'f' 
AND conrelid::regclass::text = 'challenge_notifications';

-- 2. Drop the incorrect foreign key constraint
ALTER TABLE challenge_notifications 
DROP CONSTRAINT IF EXISTS challenge_notifications_user_id_fkey;

-- 3. Add the correct foreign key constraint
-- The profiles table uses 'user_id' as the primary key reference
ALTER TABLE challenge_notifications 
ADD CONSTRAINT challenge_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 4. Update the notification functions to handle the correct user_id reference
CREATE OR REPLACE FUNCTION trigger_challenge_created_notification()
RETURNS TRIGGER AS $$
DECLARE
  challenger_profile RECORD;
  opponent_profile RECORD;
  template JSONB;
BEGIN
  -- Get challenger profile using user_id
  SELECT full_name INTO challenger_profile 
  FROM profiles WHERE user_id = NEW.challenger_id;
  
  -- Get opponent profile (if exists) using user_id
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
    NEW.challenger_id,  -- This should match user_id in profiles
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
      NEW.opponent_id,  -- This should match user_id in profiles
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

-- 5. Test the fix by checking the constraint
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    a.attname AS column_name,
    confrelid::regclass AS foreign_table_name,
    af.attname AS foreign_column_name
FROM pg_constraint AS c
JOIN pg_attribute AS a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute AS af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE c.contype = 'f' 
AND conrelid::regclass::text = 'challenge_notifications';
