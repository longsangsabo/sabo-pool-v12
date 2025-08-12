-- ===================================================================
-- 🔍 SABO DATA FLOW & CONFLICTS ANALYSIS - PART 2
-- ===================================================================

-- 📊 PHASE 4: DATA VOLUME & DISTRIBUTION
SELECT 
  'CURRENT_DATA_VOLUME' as check_type,
  'tournaments' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN tournament_type = 'double_elimination' THEN 1 END) as double_elimination_tournaments,
  COUNT(CASE WHEN format = 'double_elimination' THEN 1 END) as format_double_elimination,
  COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as active_tournaments
FROM tournaments

UNION ALL

SELECT 
  'CURRENT_DATA_VOLUME' as check_type,
  'tournament_matches' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT tournament_id) as unique_tournaments,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_matches,
  COUNT(CASE WHEN bracket_type IN ('winners', 'losers', 'semifinals', 'finals') THEN 1 END) as sabo_type_matches
FROM tournament_matches;

-- 📊 PHASE 5: SABO ROUND STRUCTURE VALIDATION
SELECT 
  'SABO_ROUND_STRUCTURE' as check_type,
  round_number,
  bracket_type,
  COUNT(*) as match_count,
  COUNT(DISTINCT tournament_id) as tournaments_using_this_round,
  CASE 
    WHEN round_number IN (1, 2, 3) THEN '🏆 WINNERS_BRACKET'
    WHEN round_number IN (101, 102, 103) THEN '🔄 LOSERS_BRANCH_A'  
    WHEN round_number IN (201, 202) THEN '🔄 LOSERS_BRANCH_B'
    WHEN round_number = 250 THEN '🥉 SEMIFINALS'
    WHEN round_number = 300 THEN '🏆 FINALS'
    ELSE '❓ NON_SABO_ROUND'
  END as sabo_classification
FROM tournament_matches
WHERE bracket_type IN ('winners', 'losers', 'semifinals', 'finals')
GROUP BY round_number, bracket_type
ORDER BY round_number;

-- 📊 PHASE 6: DUPLICATE & CONFLICT DETECTION
SELECT 
  'DUPLICATE_MATCHES_CHECK' as check_type,
  tournament_id,
  round_number,
  match_number,
  bracket_type,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(id) as match_ids
FROM tournament_matches
GROUP BY tournament_id, round_number, match_number, bracket_type
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 📊 PHASE 7: BROKEN RELATIONSHIPS DETECTION  
SELECT 
  'ORPHANED_MATCHES_CHECK' as check_type,
  tm.id as match_id,
  tm.tournament_id,
  tm.round_number,
  tm.bracket_type,
  CASE WHEN t.id IS NULL THEN 'ORPHANED_TOURNAMENT' ELSE 'OK' END as relationship_status
FROM tournament_matches tm
LEFT JOIN tournaments t ON tm.tournament_id = t.id
WHERE t.id IS NULL;

-- 📊 PHASE 8: SABO-SPECIFIC DATA ANALYSIS
SELECT 
  'SABO_TOURNAMENTS_DETAIL' as check_type,
  t.id as tournament_id,
  t.name,
  t.status,
  t.tournament_type,
  t.format,
  COUNT(tm.id) as total_matches,
  COUNT(CASE WHEN tm.status = 'completed' THEN 1 END) as completed_matches,
  COUNT(CASE WHEN tm.round_number IN (1,2,3,101,102,103,201,202,250,300) THEN 1 END) as valid_sabo_matches
FROM tournaments t
LEFT JOIN tournament_matches tm ON t.id = tm.tournament_id
WHERE t.tournament_type = 'double_elimination' OR t.format = 'double_elimination'
GROUP BY t.id, t.name, t.status, t.tournament_type, t.format
ORDER BY total_matches DESC;
