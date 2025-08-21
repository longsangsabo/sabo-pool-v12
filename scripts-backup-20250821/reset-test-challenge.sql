-- Test challenge đã có trạng thái gì
SELECT 
  id,
  status,
  club_confirmed,
  challenger_score,
  opponent_score,
  bet_points,
  challenger_id,
  opponent_id
FROM challenges 
WHERE id = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';

-- Check SPA hiện tại của 2 users trong player_rankings
SELECT 
  user_id,
  spa_points,
  updated_at
FROM player_rankings
WHERE user_id IN ('e30e1d1d-d714-4678-b63c-9f403ea2aeac', '18f6e853-b072-47fb-9c9a-e5d42a5446a5');

-- Reset challenge để test lại với status ongoing
UPDATE challenges 
SET 
  status = 'ongoing',
  club_confirmed = false,
  club_confirmed_at = NULL,
  club_note = NULL,
  completed_at = NULL
WHERE id = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';
