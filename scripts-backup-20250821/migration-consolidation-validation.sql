-- ===================================================================
-- 🧪 MIGRATION CONSOLIDATION VALIDATION TEST
-- Comprehensive testing script để verify solution hoạt động
-- ===================================================================

-- 📋 TEST SUITE: Migration Consolidation Validation
-- Run these queries AFTER deploying the 4 consolidated migrations

BEGIN;

-- ===============================================
-- TEST 1: Schema Consistency Verification
-- ===============================================

SELECT 'TEST_1_SCHEMA_CONSISTENCY' as test_name, 
       'TOURNAMENTS_TABLE' as component,
       COUNT(*) as column_count,
       CASE WHEN COUNT(*) >= 20 THEN 'PASS' ELSE 'FAIL' END as status
FROM information_schema.columns 
WHERE table_name = 'tournaments' AND table_schema = 'public'

UNION ALL

SELECT 'TEST_1_SCHEMA_CONSISTENCY' as test_name, 
       'TOURNAMENT_MATCHES_TABLE' as component,
       COUNT(*) as column_count,
       CASE WHEN COUNT(*) >= 15 THEN 'PASS' ELSE 'FAIL' END as status
FROM information_schema.columns 
WHERE table_name = 'tournament_matches' AND table_schema = 'public'

UNION ALL

SELECT 'TEST_1_SCHEMA_CONSISTENCY' as test_name, 
       'TOURNAMENT_RESULTS_TABLE' as component,
       COUNT(*) as column_count,
       CASE WHEN COUNT(*) >= 10 THEN 'PASS' ELSE 'FAIL' END as status
FROM information_schema.columns 
WHERE table_name = 'tournament_results' AND table_schema = 'public';

-- ===============================================
-- TEST 2: SABO Functions Availability  
-- ===============================================

SELECT 'TEST_2_SABO_FUNCTIONS' as test_name,
       proname as function_name,
       CASE WHEN proname IS NOT NULL THEN 'AVAILABLE' ELSE 'MISSING' END as status,
       pronargs as parameter_count
FROM pg_proc 
WHERE proname IN ('generate_sabo_tournament_bracket', 'advance_sabo_tournament', 'submit_sabo_match_score', 'validate_sabo_tournament_structure')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- ===============================================
-- TEST 3: Performance Indexes Verification
-- ===============================================

SELECT 'TEST_3_PERFORMANCE_INDEXES' as test_name,
       tablename,
       indexname,
       CASE WHEN indexname LIKE '%sabo%' OR indexname LIKE '%tournament%' THEN 'SABO_OPTIMIZED' ELSE 'STANDARD' END as index_type
FROM pg_indexes 
WHERE tablename IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ===============================================
-- TEST 4: RLS Policies Verification
-- ===============================================

SELECT 'TEST_4_RLS_POLICIES' as test_name,
       tablename,
       COUNT(*) as policy_count,
       CASE WHEN COUNT(*) >= 2 THEN 'ADEQUATE' ELSE 'INSUFFICIENT' END as security_status
FROM pg_policies 
WHERE tablename IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ===============================================
-- TEST 5: Data Integrity Verification
-- ===============================================

-- Check for orphaned records
SELECT 'TEST_5_DATA_INTEGRITY' as test_name,
       'ORPHANED_MATCHES_CHECK' as check_type,
       COUNT(*) as orphaned_count,
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as status
FROM tournament_matches tm
LEFT JOIN tournaments t ON tm.tournament_id = t.id
WHERE t.id IS NULL

UNION ALL

-- Check for duplicate matches  
SELECT 'TEST_5_DATA_INTEGRITY' as test_name,
       'DUPLICATE_MATCHES_CHECK' as check_type,
       COUNT(*) as duplicate_groups,
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as status
FROM (
  SELECT tournament_id, round_number, match_number, bracket_type, COUNT(*) as cnt
  FROM tournament_matches
  GROUP BY tournament_id, round_number, match_number, bracket_type
  HAVING COUNT(*) > 1
) duplicates;

-- ===============================================
-- TEST 6: SABO System Health Check
-- ===============================================

SELECT 'TEST_6_SABO_HEALTH' as test_name,
       'SYSTEM_STATUS' as component,
       (sabo_system_health_check()->>'system_status') as status,
       (sabo_system_health_check()->>'functions_healthy')::boolean as functions_healthy,
       (sabo_system_health_check()->>'schema_version') as schema_version;

-- ===============================================  
-- TEST 7: Migration Consolidation Log Verification
-- ===============================================

SELECT 'TEST_7_MIGRATION_LOG' as test_name,
       consolidation_date,
       old_migrations_count,
       new_schema_version,
       CASE WHEN old_migrations_count >= 60 THEN 'CONSOLIDATION_SUCCESSFUL' ELSE 'CONSOLIDATION_INCOMPLETE' END as status
FROM migration_consolidation_log
ORDER BY consolidation_date DESC
LIMIT 1;

-- ===============================================
-- TEST 8: Foreign Key Constraints Verification  
-- ===============================================

SELECT 'TEST_8_FOREIGN_KEYS' as test_name,
       tc.table_name,
       tc.constraint_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       'CONSTRAINT_EXISTS' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ===============================================
-- TEST 9: Trigger Verification
-- ===============================================

SELECT 'TEST_9_TRIGGERS' as test_name,
       trigger_name,
       event_object_table as table_name,
       action_timing,
       event_manipulation,
       CASE WHEN trigger_name LIKE '%updated_at%' THEN 'AUDIT_TRIGGER' ELSE 'BUSINESS_TRIGGER' END as trigger_type
FROM information_schema.triggers
WHERE event_object_table IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===============================================
-- TEST 10: Sample SABO Tournament Creation Test
-- ===============================================

DO $$
DECLARE
  v_test_tournament_id UUID;
  v_bracket_result jsonb;
  v_validation_result jsonb;
BEGIN
  -- Create test tournament
  INSERT INTO tournaments (
    name, tournament_type, format, max_participants, tournament_start
  ) VALUES (
    'CONSOLIDATION_TEST_TOURNAMENT', 'double_elimination', 'double_elimination', 16, NOW() + INTERVAL '1 day'
  ) RETURNING id INTO v_test_tournament_id;
  
  -- Add 16 test registrations (using system users if available)
  INSERT INTO tournament_registrations (tournament_id, user_id, registration_status)
  SELECT v_test_tournament_id, auth.uid(), 'confirmed'
  FROM generate_series(1, 16) i
  WHERE auth.uid() IS NOT NULL
  ON CONFLICT DO NOTHING;
  
  -- Test bracket generation (if we have participants)
  IF EXISTS (SELECT 1 FROM tournament_registrations WHERE tournament_id = v_test_tournament_id) THEN
    SELECT generate_sabo_tournament_bracket(v_test_tournament_id) INTO v_bracket_result;
    SELECT validate_sabo_tournament_structure(v_test_tournament_id) INTO v_validation_result;
    
    RAISE NOTICE 'TEST_10_SAMPLE_CREATION: Tournament ID: %', v_test_tournament_id;
    RAISE NOTICE 'TEST_10_SAMPLE_CREATION: Bracket Result: %', v_bracket_result;
    RAISE NOTICE 'TEST_10_SAMPLE_CREATION: Validation Result: %', v_validation_result;
  ELSE
    RAISE NOTICE 'TEST_10_SAMPLE_CREATION: Skipped - No auth user available for test';
  END IF;
  
  -- Cleanup test data
  DELETE FROM tournaments WHERE id = v_test_tournament_id;
END $$;

-- ===============================================
-- TEST SUMMARY REPORT
-- ===============================================

SELECT 
  '🏁 CONSOLIDATION_VALIDATION_SUMMARY' as report_type,
  NOW() as validation_timestamp,
  'Migration consolidation validation completed' as message,
  'Check all TEST results above for PASS/FAIL status' as instructions;

ROLLBACK; -- Don't commit test data
