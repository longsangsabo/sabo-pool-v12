-- ===================================================================
-- 🔍 SABO DATABASE STRUCTURE ANALYSIS
-- Kiểm tra cách SABO Double Elimination ghi data và tìm conflicts
-- ===================================================================

-- 📊 PHASE 1: BẢNG TOURNAMENTS - Cấu trúc chính
SELECT 
  'TOURNAMENTS_TABLE_COLUMNS' as analysis_type,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('tournament_type', 'format', 'bracket_type') THEN '🎯 TOURNAMENT_TYPE'
    WHEN column_name IN ('status', 'winner_id', 'completed_at') THEN '📊 STATUS_TRACKING'  
    WHEN column_name IN ('id', 'name', 'club_id') THEN '🏷️ BASIC_INFO'
    ELSE '📝 OTHER'
  END as column_category
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
  AND table_schema = 'public'
ORDER BY column_category, column_name;

-- 📊 PHASE 2: BẢNG TOURNAMENT_MATCHES - Schema Analysis  
SELECT 
  'TOURNAMENT_MATCHES_COLUMNS' as analysis_type,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('round_number', 'match_number', 'bracket_type', 'branch_type') THEN '🎯 SABO_STRUCTURE'
    WHEN column_name IN ('player1_id', 'player2_id', 'winner_id') THEN '👥 PLAYERS'
    WHEN column_name IN ('score_player1', 'score_player2', 'status') THEN '⚽ SCORING'
    WHEN column_name IN ('tournament_id', 'id') THEN '🔗 RELATIONSHIPS'
    ELSE '📝 OTHER'
  END as column_category
FROM information_schema.columns 
WHERE table_name = 'tournament_matches' 
  AND table_schema = 'public'
ORDER BY column_category, column_name;

-- 📊 PHASE 3: KIỂM TRA SABO FUNCTIONS & OPERATIONS
SELECT 
  'SABO_FUNCTIONS_ANALYSIS' as analysis_type,
  proname as function_name,
  pronargs as param_count,
  CASE 
    WHEN proname LIKE '%generate%' THEN '🏗️ BRACKET_GENERATION'
    WHEN proname LIKE '%advance%' THEN '▶️ ADVANCEMENT_LOGIC'  
    WHEN proname LIKE '%submit%' THEN '⚽ SCORE_SUBMISSION'
    WHEN proname LIKE '%validate%' OR proname LIKE '%health%' THEN '✅ VALIDATION'
    ELSE '🔧 OTHER'
  END as function_category
FROM pg_proc 
WHERE proname LIKE '%sabo%' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY function_category, proname;
