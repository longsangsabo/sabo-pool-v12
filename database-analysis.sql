-- ===================================================================
-- SABO POOL V12 - DATABASE ANALYSIS REPORT  
-- Kiểm tra toàn diện cách SABO Double Elimination ghi data
-- ===================================================================

-- 1. KIỂM TRA CÁC BẢNG TOURNAMENT HIỆN CÓ
SELECT 
  schemaname, 
  tablename,
  CASE 
    WHEN tablename LIKE '%_v2' THEN 'V2_SCHEMA'
    WHEN tablename LIKE '%tournament_matches%' THEN 'CORE_MATCHES'
    WHEN tablename LIKE '%tournament_results%' THEN 'RESULTS_TABLE' 
    WHEN tablename LIKE '%tournaments%' THEN 'MAIN_TOURNAMENTS'
    ELSE 'OTHER'
  END as table_category
FROM pg_tables 
WHERE tablename LIKE '%tournament%' 
ORDER BY table_category, tablename;

-- 2. KIỂM TRA CỘT TRONG BẢNG TOURNAMENT_MATCHES (CORE TABLE)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tournament_matches' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. KIỂM TRA CỘT TRONG BẢNG TOURNAMENTS (MAIN TABLE)  
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. KIỂM TRA CÁC FUNCTION SABO HIỆN CÓ
SELECT 
  proname as function_name,
  pronargs as param_count,
  prorettype::regtype as return_type,
  prosrc LIKE '%tournament_matches%' as uses_matches_table,
  prosrc LIKE '%tournaments%' as uses_tournaments_table,
  prosrc LIKE '%INSERT%' as has_insert,
  prosrc LIKE '%UPDATE%' as has_update
FROM pg_proc 
WHERE proname LIKE '%sabo%' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- 5. KIỂM TRA DỮ LIỆU SABO HIỆN CÓ
SELECT 
  'tournaments' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN tournament_type = 'double_elimination' THEN 1 END) as double_elim_count,
  COUNT(CASE WHEN format = 'double_elimination' THEN 1 END) as format_double_elim
FROM tournaments

UNION ALL

SELECT 
  'tournament_matches' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT tournament_id) as tournaments_with_matches,
  COUNT(CASE WHEN bracket_type IN ('winners', 'losers', 'semifinals', 'finals') THEN 1 END) as sabo_matches
FROM tournament_matches;

-- 6. KIỂM TRA CONFLICT VÀ DUPLICATE TRONG MATCHES
SELECT 
  'duplicate_matches_check' as check_type,
  COUNT(*) as total_matches,
  COUNT(DISTINCT(tournament_id, round_number, match_number, bracket_type)) as unique_matches,
  COUNT(*) - COUNT(DISTINCT(tournament_id, round_number, match_number, bracket_type)) as potential_duplicates
FROM tournament_matches

UNION ALL

SELECT 
  'sabo_round_structure_check' as check_type,
  COUNT(*) as total_sabo_matches,
  COUNT(CASE WHEN round_number IN (1,2,3,101,102,103,201,202,250,300) THEN 1 END) as valid_sabo_rounds,
  COUNT(*) - COUNT(CASE WHEN round_number IN (1,2,3,101,102,103,201,202,250,300) THEN 1 END) as invalid_rounds
FROM tournament_matches
WHERE bracket_type IN ('winners', 'losers', 'semifinals', 'finals');

-- 7. KIỂM TRA TOURNAMENT RESULTS SCHEMA
SELECT 
  'tournament_results_schema' as table_info,
  COUNT(*) as total_columns,
  SUM(CASE WHEN column_name IN ('tournament_id', 'user_id', 'final_position') THEN 1 ELSE 0 END) as core_columns,
  SUM(CASE WHEN column_name LIKE '%spa%' OR column_name LIKE '%elo%' THEN 1 ELSE 0 END) as points_columns
FROM information_schema.columns 
WHERE table_name = 'tournament_results' 
  AND table_schema = 'public';

-- 8. KIỂM TRA RLS POLICIES TRÊN CÁC BẢNG CORE
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('tournaments', 'tournament_matches', 'tournament_results')
ORDER BY tablename, policyname;
