-- ============================================================================
-- TEST SCRIPT CHO TOURNAMENT RESULTS AUTO TRIGGER
-- ============================================================================

-- 1. Test với tournament hiện tại
SELECT 'Testing Tournament Results Trigger' as test_title;

-- Kiểm tra tournaments có type sabo/double_elimination
SELECT 
  id,
  name,
  tournament_type,
  status,
  created_at,
  updated_at,
  winner_id
FROM tournaments 
WHERE tournament_type IN ('sabo', 'double_elimination')
ORDER BY created_at DESC
LIMIT 5;

-- 2. Kiểm tra final matches (Round 300)
SELECT 
  tm.id,
  tm.tournament_id,
  tm.round_number,
  tm.match_number,
  tm.status,
  tm.winner_id,
  t.name as tournament_name
FROM tournament_matches tm
JOIN tournaments t ON t.id = tm.tournament_id
WHERE tm.round_number = 300 
  AND t.tournament_type IN ('sabo', 'double_elimination')
ORDER BY tm.created_at DESC;

-- 3. Kiểm tra tournament_results đã tồn tại
SELECT 
  tr.tournament_id,
  t.name as tournament_name,
  COUNT(*) as results_count,
  t.status as tournament_status
FROM tournament_results tr
JOIN tournaments t ON t.id = tr.tournament_id
WHERE t.tournament_type IN ('sabo', 'double_elimination')
GROUP BY tr.tournament_id, t.name, t.status
ORDER BY COUNT(*) DESC;

-- 4. Function để test manual completion
CREATE OR REPLACE FUNCTION test_manual_completion()
RETURNS TABLE(
  tournament_id uuid,
  tournament_name text,
  final_match_status text,
  can_complete boolean,
  reason text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    COALESCE(tm.status, 'no_final_match') as final_match_status,
    CASE 
      WHEN t.status = 'completed' THEN false
      WHEN tm.status IS NULL THEN false
      WHEN tm.status != 'completed' THEN false
      WHEN tm.winner_id IS NULL THEN false
      WHEN EXISTS(SELECT 1 FROM tournament_results WHERE tournament_id = t.id) THEN false
      ELSE true
    END as can_complete,
    CASE 
      WHEN t.status = 'completed' THEN 'Tournament already completed'
      WHEN tm.status IS NULL THEN 'No final match found'
      WHEN tm.status != 'completed' THEN 'Final match not completed'
      WHEN tm.winner_id IS NULL THEN 'Final match has no winner'
      WHEN EXISTS(SELECT 1 FROM tournament_results WHERE tournament_id = t.id) THEN 'Results already exist'
      ELSE 'Ready for completion'
    END as reason
  FROM tournaments t
  LEFT JOIN tournament_matches tm ON tm.tournament_id = t.id 
    AND tm.round_number = 300 
    AND tm.match_number = 1
  WHERE t.tournament_type IN ('sabo', 'double_elimination')
  ORDER BY t.created_at DESC;
END;
$$;

-- Run test
SELECT * FROM test_manual_completion();

-- 5. Verify trigger installation
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  trigger_schema,
  trigger_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_tournament_results';

-- 6. Check RPC function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition IS NOT NULL as has_definition
FROM information_schema.routines
WHERE routine_name = 'manual_complete_tournament'
  AND routine_schema = 'public';

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================
-- 1. Run tournament-results-auto-trigger.sql first
-- 2. Run this test script to verify everything is working
-- 3. Test manual completion with specific tournament_id:
--    SELECT manual_complete_tournament('<tournament_id>');
-- ============================================================================
