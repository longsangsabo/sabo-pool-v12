-- Sync SPA points from player_rankings to profiles table
-- This will update all profiles with their current SPA points from rankings

-- First, let's see the current state
SELECT 
  p.id as profile_id,
  p.user_id,
  p.display_name,
  p.spa_points as profile_spa,
  pr.spa_points as ranking_spa,
  (pr.spa_points - p.spa_points) as difference
FROM profiles p
LEFT JOIN player_rankings pr ON p.user_id = pr.user_id
WHERE pr.spa_points > 0 OR p.spa_points > 0
ORDER BY pr.spa_points DESC;

-- Update profiles with SPA from player_rankings
UPDATE profiles 
SET spa_points = COALESCE(
  (SELECT spa_points FROM player_rankings WHERE user_id = profiles.user_id), 
  0
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM player_rankings WHERE user_id = profiles.user_id
);

-- Verify the sync
SELECT 
  p.id as profile_id,
  p.user_id,
  p.display_name,
  p.spa_points as profile_spa,
  pr.spa_points as ranking_spa,
  CASE 
    WHEN p.spa_points = pr.spa_points THEN '✅ SYNCED'
    ELSE '❌ MISMATCH'
  END as status
FROM profiles p
LEFT JOIN player_rankings pr ON p.user_id = pr.user_id
WHERE pr.spa_points > 0 OR p.spa_points > 0
ORDER BY pr.spa_points DESC;
