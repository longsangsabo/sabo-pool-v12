-- Test rank approval flow with SQL
-- This simulates what happens when club owner approves a rank

-- Check current state
SELECT 
  pr.user_id,
  pr.user_name,
  pr.current_rank,
  pr.verified_rank,
  pr.spa_points,
  p.display_name,
  p.current_rank as profile_rank,
  p.verified_rank as profile_verified_rank
FROM player_rankings pr
LEFT JOIN profiles p ON pr.user_id = p.user_id
WHERE pr.current_rank = 'K'
AND pr.user_name = 'Phạm Minh Long'
LIMIT 1;

-- Simulate rank approval: K -> H
-- Update player_rankings first
UPDATE player_rankings 
SET 
  verified_rank = 'H',
  current_rank = 'H',
  spa_points = spa_points + 100,  -- H rank bonus
  updated_at = NOW()
WHERE user_id = 'c227cca4-9687-4964-8d4a-051198545b29';

-- Update profiles to match
UPDATE profiles 
SET 
  verified_rank = 'H',
  current_rank = 'H',
  updated_at = NOW()
WHERE user_id = 'c227cca4-9687-4964-8d4a-051198545b29';

-- Verify the changes
SELECT 
  pr.user_id,
  pr.user_name,
  pr.current_rank,
  pr.verified_rank,
  pr.spa_points,
  p.display_name,
  p.current_rank as profile_rank,
  p.verified_rank as profile_verified_rank
FROM player_rankings pr
LEFT JOIN profiles p ON pr.user_id = p.user_id
WHERE pr.user_id = 'c227cca4-9687-4964-8d4a-051198545b29';
