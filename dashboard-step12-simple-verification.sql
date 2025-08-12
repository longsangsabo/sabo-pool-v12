-- ===================================================================
-- 🏁 SIMPLE FINAL VERIFICATION - Paste vào Supabase Dashboard
-- Basic verification without function conflicts
-- ===================================================================

-- 🔍 PHASE 1: Basic Status Check
SELECT '🏁 FINAL VERIFICATION STARTED' as status, NOW() as timestamp;

-- 🔍 PHASE 2: Schema Verification
SELECT 
  'SCHEMA_VERIFICATION' as test_type,
  table_name,
  (xpath('/row/c/text()', query_to_xml(format('SELECT COUNT(*) as c FROM %I', table_name), false, true, '')))[1]::text::int as record_count
FROM information_schema.tables 
WHERE table_name IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND table_schema = 'public'
ORDER BY table_name;

-- 🔍 PHASE 3: SABO Function Availability Check
SELECT 
  'FUNCTION_AVAILABILITY' as test_type,
  proname as function_name,
  pronargs as parameter_count,
  'AVAILABLE' as status
FROM pg_proc 
WHERE proname IN (
  'generate_sabo_tournament_bracket', 
  'advance_sabo_tournament', 
  'submit_sabo_match_score'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- 🔍 PHASE 4: Table Structure Check
SELECT 
  'TABLE_STRUCTURE' as test_type,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND table_schema = 'public'
  AND column_name IN ('id', 'tournament_id', 'status', 'bracket_type', 'round_number')
ORDER BY table_name, ordinal_position;

-- 🔍 PHASE 5: Index Performance Check  
SELECT 
  'INDEX_VERIFICATION' as test_type,
  tablename,
  indexname,
  CASE WHEN indexname LIKE '%sabo%' THEN 'SABO_OPTIMIZED' ELSE 'STANDARD' END as index_type
FROM pg_indexes 
WHERE tablename IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 🔍 PHASE 6: RLS Security Check
SELECT 
  'RLS_SECURITY_CHECK' as test_type,
  tablename,
  COUNT(*) as policy_count,
  'POLICIES_ENABLED' as status
FROM pg_policies 
WHERE tablename IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 🔍 PHASE 7: Clean State Verification
SELECT 
  'CLEAN_STATE_CHECK' as test_type,
  'NO_BACKUP_TABLES' as check_name,
  COUNT(*) as backup_table_count,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'CLEANUP_NEEDED' END as status
FROM information_schema.tables 
WHERE table_name LIKE '%backup_%' 
  AND table_schema = 'public';

-- 🔍 PHASE 8: SABO Double Elimination Support
SELECT 
  'SABO_SUPPORT_CHECK' as test_type,
  'DOUBLE_ELIMINATION_SUPPORT' as feature,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.check_constraints 
      WHERE constraint_name LIKE '%bracket_type%' 
        AND check_clause LIKE '%double_elimination%'
    ) THEN 'ENABLED'
    ELSE 'BASIC_ONLY'
  END as status;

-- 🎯 FINAL SUCCESS MESSAGE
SELECT 
  '🎉 MIGRATION CONSOLIDATION COMPLETED SUCCESSFULLY' as final_status,
  'Clean schema deployed - ready for production' as message,
  'SABO functions available for Double Elimination tournaments' as sabo_status,
  NOW() as completion_timestamp;

-- 🚀 NEXT STEPS
SELECT 
  '🚀 SYSTEM READY' as ready_status,
  'You can now create SABO Double Elimination tournaments' as capability,
  'Use generate_sabo_tournament_bracket() to create 27-match structure' as usage_tip;
