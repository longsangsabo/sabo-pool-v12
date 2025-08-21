-- Test trigger manually by updating challenge to completed
UPDATE challenges 
SET 
  status = 'completed',
  club_confirmed = true,
  club_confirmed_at = NOW(),
  completed_at = NOW()
WHERE id = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';

-- Check if SPA points changed
SELECT 
  'After trigger test:' as info,
  user_id,
  spa_points,
  updated_at
FROM player_rankings
WHERE user_id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5')
ORDER BY user_id;
