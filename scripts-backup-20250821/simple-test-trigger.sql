-- ============================================================================
-- SIMPLIFIED TEST SCRIPT - SCHEMA COMPATIBLE
-- ============================================================================

-- 1. Basic tournament check (minimal columns)
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

-- 2. Check final matches
SELECT 'STEP 2: Checking final matches (Round 300)' as step;

SELECT 
  tm.id as match_id,
  tm.tournament_id,
  tm.round_number,
  tm.status,
  tm.winner_id,
  t.name as tournament_name,
  t.status as tournament_status
FROM tournament_matches tm
JOIN tournaments t ON t.id = tm.tournament_id
WHERE tm.round_number = 300 
  AND t.tournament_type IN ('sabo', 'double_elimination')
ORDER BY tm.created_at DESC;

-- 3. Check existing results
SELECT 'STEP 3: Checking existing tournament_results' as step;

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

-- 4. Check trigger installation
SELECT 'STEP 4: Checking trigger installation' as step;

SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_tournament_results';

-- 5. Check RPC function
SELECT 'STEP 5: Checking RPC function' as step;

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'manual_complete_tournament'
  AND routine_schema = 'public';

-- 6. Simple completion test function
CREATE OR REPLACE FUNCTION simple_completion_test()
RETURNS TABLE(
  tournament_id uuid,
  tournament_name text,
  tournament_status text,
  final_match_exists boolean,
  final_completed boolean,
  has_winner boolean,
  results_exist boolean,
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
    EXISTS(SELECT 1 FROM tournament_results WHERE tournament_id = t.id) as results_exist,
    (t.status != 'completed' AND tm.status = 'completed' AND tm.winner_id IS NOT NULL 
     AND NOT EXISTS(SELECT 1 FROM tournament_results WHERE tournament_id = t.id)) as ready_for_manual
  FROM tournaments t
  LEFT JOIN tournament_matches tm ON tm.tournament_id = t.id 
    AND tm.round_number = 300 
    AND tm.match_number = 1
  WHERE t.tournament_type IN ('sabo', 'double_elimination')
  ORDER BY t.created_at DESC;
END;
$$;

-- Run the test
SELECT 'STEP 6: Running completion test' as step;
SELECT * FROM simple_completion_test();

-- 7. Check tournament_registrations table
SELECT 'STEP 7: Checking tournament_registrations' as step;

SELECT 
  tournament_id,
  COUNT(*) as registration_count
FROM tournament_registrations 
GROUP BY tournament_id
ORDER BY COUNT(*) DESC
LIMIT 5;

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================
-- 1. Run check-schema-compatibility.sql first to verify schema
-- 2. Run tournament-results-auto-trigger.sql to install trigger
-- 3. Run this test to verify everything works
-- 4. For manual completion: SELECT manual_complete_tournament('<tournament_id>');
-- ============================================================================
