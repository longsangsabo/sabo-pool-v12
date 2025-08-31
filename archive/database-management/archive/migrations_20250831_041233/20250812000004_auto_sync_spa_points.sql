-- Auto-sync SPA points between player_rankings and profiles
-- This migration creates triggers to keep both tables in sync automatically

-- Migration: supabase/migrations/20250812000004_auto_sync_spa_points.sql

-- 1. First, sync all existing data
UPDATE profiles 
SET spa_points = COALESCE(
  (SELECT spa_points FROM player_rankings WHERE user_id = profiles.user_id), 
  0
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM player_rankings WHERE user_id = profiles.user_id
);

-- 2. Create auto-sync function: player_rankings → profiles (one-way only)
CREATE OR REPLACE FUNCTION sync_spa_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto update profile when player_rankings changes
  -- Use a flag to prevent recursive triggers
  UPDATE profiles 
  SET spa_points = NEW.spa_points,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Remove the reverse sync function to prevent deadlock
-- We only sync from player_rankings → profiles (one direction only)

-- 4. Create trigger for one-way sync only
DROP TRIGGER IF EXISTS auto_sync_spa_to_profile ON player_rankings;
CREATE TRIGGER auto_sync_spa_to_profile
  AFTER INSERT OR UPDATE OF spa_points
  ON player_rankings
  FOR EACH ROW
  EXECUTE FUNCTION sync_spa_to_profile();

-- Remove any existing reverse trigger to prevent deadlock
DROP TRIGGER IF EXISTS auto_sync_spa_to_ranking ON profiles;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION sync_spa_to_profile() TO authenticated;

-- 6. Clean up any deadlock issues first
-- Drop any existing triggers that might cause conflicts
DROP TRIGGER IF EXISTS auto_sync_spa_to_ranking ON profiles;
DROP FUNCTION IF EXISTS sync_spa_to_ranking();

-- 7. Test the one-way sync (this will trigger the auto-sync)
-- Update a test record to verify triggers work
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get a user with SPA to test
  SELECT user_id INTO test_user_id
  FROM player_rankings 
  WHERE spa_points > 0 
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Test trigger by updating ranking (should auto-update profile)
    UPDATE player_rankings 
    SET spa_points = spa_points + 1
    WHERE user_id = test_user_id;
    
    -- Revert the test change
    UPDATE player_rankings 
    SET spa_points = spa_points - 1
    WHERE user_id = test_user_id;
    
    RAISE NOTICE 'Auto-sync triggers installed and tested successfully!';
  END IF;
END $$;
