-- ============================================================================
-- CORRECTED TEST SCRIPT - BASED ON REAL DATABASE SCHEMA
-- ============================================================================

-- 1. Check tournaments (confirmed columns exist)
SELECT 'STEP 1: Checking tournaments' as step;

SELECT 
  id,
  name,
  tournament_type,
  status,
  created_at
FROM tournaments 
WHERE tournament_type IN ('sabo', 'double_elimination')
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check final matches (confirmed Round 300 exists)
SELECT 'STEP 2: Checking final matches (Round 300)' as step;

SELECT 
  tm.id as match_id,
  tm.tournament_id,
  tm.round_number,
  tm.status,
  tm.winner_id,
  tm.score_player1,
  tm.score_player2,
  tm.completed_at,
  t.name as tournament_name,
  t.status as tournament_status
FROM tournament_matches tm
JOIN tournaments t ON t.id = tm.tournament_id
WHERE tm.round_number = 300 
  AND t.tournament_type IN ('sabo', 'double_elimination')
ORDER BY tm.created_at DESC;

-- 3. Check tournament_registrations (not tournament_participants!)
SELECT 'STEP 3: Checking tournament_registrations' as step;

SELECT 
  tournament_id,
  user_id,
  registration_status,
  COUNT(*) OVER (PARTITION BY tournament_id) as total_participants
FROM tournament_registrations
WHERE tournament_id IN (
  SELECT id FROM tournaments 
  WHERE tournament_type IN ('sabo', 'double_elimination')
)
LIMIT 10;

-- 4. Check existing tournament_results
SELECT 'STEP 4: Checking existing tournament_results' as step;

SELECT 
  tr.tournament_id,
  t.name as tournament_name,
  COUNT(*) as results_count,
  t.status
FROM tournament_results tr
JOIN tournaments t ON t.id = tr.tournament_id
WHERE t.tournament_type IN ('sabo', 'double_elimination')
GROUP BY tr.tournament_id, t.name, t.status
ORDER BY COUNT(*) DESC;

-- 5. Check trigger installation
SELECT 'STEP 5: Checking trigger installation' as step;

SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_tournament_results';

-- 6. Check RPC function
SELECT 'STEP 6: Checking RPC function' as step;

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'manual_complete_tournament'
  AND routine_schema = 'public';

-- 7. CORRECTED completion test function
CREATE OR REPLACE FUNCTION corrected_completion_test()
RETURNS TABLE(
  tournament_id uuid,
  tournament_name text,
  tournament_status text,
  final_match_exists boolean,
  final_completed boolean,
  has_winner boolean,
  results_exist boolean,
  participant_count bigint,
  ready_for_manual boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.status,
    (tm.id IS NOT NULL) as final_match_exists,
    (tm.status = 'completed') as final_completed,
    (tm.winner_id IS NOT NULL) as has_winner,
    EXISTS(SELECT 1 FROM tournament_results tr WHERE tr.tournament_id = t.id) as results_exist,
    COALESCE((
      SELECT COUNT(*) 
      FROM tournament_registrations reg
      WHERE reg.tournament_id = t.id 
        AND reg.registration_status = 'confirmed'
    ), 0) as participant_count,
    (t.status != 'completed' 
     AND tm.status = 'completed' 
     AND tm.winner_id IS NOT NULL 
     AND NOT EXISTS(SELECT 1 FROM tournament_results tr2 WHERE tr2.tournament_id = t.id)
    ) as ready_for_manual
  FROM tournaments t
  LEFT JOIN tournament_matches tm ON tm.tournament_id = t.id 
    AND tm.round_number = 300 
    AND tm.match_number = 1
  WHERE t.tournament_type IN ('sabo', 'double_elimination')
  ORDER BY t.created_at DESC;
END;
$$;

-- Run the corrected test
SELECT 'STEP 7: Running corrected completion test' as step;
SELECT * FROM corrected_completion_test();

-- 8. Test manual completion for a specific tournament
SELECT 'STEP 8: Manual completion candidates' as step;

SELECT 
  t.id as tournament_id,
  t.name,
  tm.status as final_status,
  tm.winner_id IS NOT NULL as has_winner,
  EXISTS(SELECT 1 FROM tournament_results tr WHERE tr.tournament_id = t.id) as has_results,
  (SELECT COUNT(*) FROM tournament_registrations reg WHERE reg.tournament_id = t.id AND reg.registration_status = 'confirmed') as participants
FROM tournaments t
JOIN tournament_matches tm ON tm.tournament_id = t.id 
  AND tm.round_number = 300 
  AND tm.match_number = 1
WHERE t.tournament_type IN ('sabo', 'double_elimination')
  AND tm.status = 'completed'
  AND tm.winner_id IS NOT NULL
  AND NOT EXISTS(SELECT 1 FROM tournament_results tr WHERE tr.tournament_id = t.id)
ORDER BY t.created_at DESC;

-- ============================================================================
-- READY FOR DEPLOYMENT
-- ============================================================================
-- Based on real database schema:
-- ✅ tournaments table confirmed with all needed columns
-- ✅ tournament_registrations table (not tournament_participants)
-- ✅ tournament_matches table with Round 300 final matches
-- ✅ tournament_results table exists (empty, ready for data)
-- ✅ Final matches already completed and ready for processing
-- ============================================================================
