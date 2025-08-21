-- ===================================================================
-- 🧪 SABO SYSTEM DATA FLOW TEST
-- Test cụ thể cách SABO ghi data vào database
-- ===================================================================

-- 🎯 TEST 1: Kiểm tra current schema của 3 tables core
SELECT 'TOURNAMENTS_SCHEMA' as test_name, 
       COUNT(*) as column_count,
       string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'tournaments' AND table_schema = 'public'

UNION ALL

SELECT 'TOURNAMENT_MATCHES_SCHEMA' as test_name,
       COUNT(*) as column_count, 
       string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_name = 'tournament_matches' AND table_schema = 'public'

UNION ALL

SELECT 'TOURNAMENT_RESULTS_SCHEMA' as test_name,
       COUNT(*) as column_count,
       string_agg(column_name, ', ' ORDER BY ordinal_position) as columns  
FROM information_schema.columns
WHERE table_name = 'tournament_results' AND table_schema = 'public';

-- 🎯 TEST 2: Kiểm tra SABO functions hiện có
SELECT 'SABO_FUNCTIONS_AVAILABLE' as test_name,
       COUNT(*) as function_count,
       string_agg(proname, ', ' ORDER BY proname) as available_functions
FROM pg_proc 
WHERE proname LIKE '%sabo%' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 🎯 TEST 3: Data integrity check
SELECT 'CURRENT_SABO_TOURNAMENTS' as test_name,
       COUNT(*) as total_double_elim_tournaments,
       COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as active_tournaments,
       string_agg(DISTINCT status, ', ') as all_statuses
FROM tournaments 
WHERE tournament_type = 'double_elimination' OR format = 'double_elimination';

-- 🎯 TEST 4: Matches structure validation  
SELECT 'SABO_MATCHES_DISTRIBUTION' as test_name,
       round_number,
       bracket_type,
       COUNT(*) as match_count,
       COUNT(DISTINCT tournament_id) as tournaments
FROM tournament_matches
WHERE round_number IN (1,2,3,101,102,103,201,202,250,300)
GROUP BY round_number, bracket_type
ORDER BY round_number;

-- 🎯 TEST 5: Duplicate detection
SELECT 'DUPLICATE_MATCHES_FOUND' as test_name,
       COUNT(*) as total_groups,
       SUM(CASE WHEN match_count > 1 THEN 1 ELSE 0 END) as duplicate_groups,
       MAX(match_count) as max_duplicates_per_group
FROM (
  SELECT tournament_id, round_number, match_number, bracket_type,
         COUNT(*) as match_count
  FROM tournament_matches  
  GROUP BY tournament_id, round_number, match_number, bracket_type
) duplicates;

-- 🎯 TEST 6: Foreign key integrity
SELECT 'ORPHANED_MATCHES_CHECK' as test_name,
       COUNT(*) as total_orphaned_matches,
       COUNT(DISTINCT tm.tournament_id) as orphaned_tournament_ids
FROM tournament_matches tm
LEFT JOIN tournaments t ON tm.tournament_id = t.id
WHERE t.id IS NULL;

-- 🎯 TEST 7: Score data analysis
SELECT 'MATCH_COMPLETION_STATUS' as test_name,
       status,
       COUNT(*) as match_count,
       COUNT(CASE WHEN winner_id IS NOT NULL THEN 1 END) as matches_with_winner,
       AVG(CASE WHEN score_player1 IS NOT NULL AND score_player2 IS NOT NULL 
               THEN score_player1 + score_player2 END) as avg_total_score
FROM tournament_matches
WHERE round_number IN (1,2,3,101,102,103,201,202,250,300)
GROUP BY status
ORDER BY status;
