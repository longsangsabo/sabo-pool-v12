-- Auto-sync SPA points: player_rankings → profiles (one-way, no deadlock)
-- Migration: supabase/migrations/20250812000004_auto_sync_spa_points_fixed.sql

-- 1. Clean up any existing conflicting triggers/functions first
DROP TRIGGER IF EXISTS auto_sync_spa_to_ranking ON profiles;
DROP TRIGGER IF EXISTS auto_sync_spa_to_profile ON player_rankings;
DROP FUNCTION IF EXISTS sync_spa_to_ranking();
DROP FUNCTION IF EXISTS sync_spa_to_profile();

-- 2. Sync all existing data from player_rankings → profiles
UPDATE profiles 
SET spa_points = COALESCE(
  (SELECT spa_points FROM player_rankings WHERE user_id = profiles.user_id), 
  0
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM player_rankings WHERE user_id = profiles.user_id
);

-- 3. Create one-way sync function: player_rankings → profiles
CREATE OR REPLACE FUNCTION sync_spa_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto update profile when player_rankings SPA changes
  UPDATE profiles 
  SET spa_points = NEW.spa_points,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for one-way sync (no reverse trigger = no deadlock)
CREATE TRIGGER auto_sync_spa_to_profile
  AFTER INSERT OR UPDATE OF spa_points
  ON player_rankings
  FOR EACH ROW
  EXECUTE FUNCTION sync_spa_to_profile();

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION sync_spa_to_profile() TO authenticated;

-- 6. Test the sync
DO $$
DECLARE
  test_user_id UUID;
  before_spa INTEGER;
  after_spa INTEGER;
BEGIN
  -- Get a user with SPA to test
  SELECT user_id INTO test_user_id
  FROM player_rankings 
  WHERE spa_points > 0 
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Get current profile SPA
    SELECT spa_points INTO before_spa 
    FROM profiles 
    WHERE user_id = test_user_id;
    
    -- Test trigger by updating ranking (should auto-update profile)
    UPDATE player_rankings 
    SET spa_points = spa_points + 1
    WHERE user_id = test_user_id;
    
    -- Check if profile was updated
    SELECT spa_points INTO after_spa 
    FROM profiles 
    WHERE user_id = test_user_id;
    
    -- Revert the test change
    UPDATE player_rankings 
    SET spa_points = spa_points - 1
    WHERE user_id = test_user_id;
    
    IF after_spa = before_spa + 1 THEN
      RAISE NOTICE 'SUCCESS: Auto-sync trigger working correctly! Profile SPA: % → %', before_spa, after_spa;
    ELSE
      RAISE NOTICE 'ERROR: Auto-sync not working. Profile SPA stayed at %', after_spa;
    END IF;
  ELSE
    RAISE NOTICE 'No users with SPA found for testing';
  END IF;
END $$;
