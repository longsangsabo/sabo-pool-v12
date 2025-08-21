-- Create test challenge for club approval workflow
-- Run in Supabase SQL Editor

-- Get first two profile user_ids
WITH user_profiles AS (
  SELECT user_id, full_name, ROW_NUMBER() OVER (ORDER BY user_id) as rn
  FROM profiles
  LIMIT 2
)
INSERT INTO challenges (
  id,
  challenger_id,
  opponent_id,
  status,
  bet_points,
  race_to,
  challenger_score,
  opponent_score,
  club_confirmed,
  scheduled_time,
  created_at
)
SELECT 
  gen_random_uuid(),
  p1.user_id,
  p2.user_id,
  'pending_approval',
  300,
  5,
  5,
  3,
  false,
  NOW() + INTERVAL '1 day',
  NOW() - INTERVAL '30 minutes'
FROM user_profiles p1
CROSS JOIN user_profiles p2
WHERE p1.rn = 1 AND p2.rn = 2;

-- Check result
SELECT 
  id,
  status,
  challenger_score,
  opponent_score,
  club_confirmed,
  created_at
FROM challenges 
WHERE status = 'pending_approval'
ORDER BY created_at DESC
LIMIT 3;
