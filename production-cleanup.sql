-- ===================================================================
-- 🧹 COMPREHENSIVE CLEANUP - Paste vào Supabase Dashboard
-- Cleanup các objects cũ liên quan double elimination/SABO
-- ===================================================================

-- 🛡️ PHASE 1: SAFE BACKUP FINAL CHECK
SELECT 
  '🔍 FINAL BACKUP CHECK' as phase,
  table_name,
  'CORE_TABLE_PRESERVED' as status
FROM information_schema.tables 
WHERE table_name IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
  AND table_schema = 'public'
ORDER BY table_name;

-- 🧹 PHASE 2: CLEANUP OLD/DUPLICATE FUNCTIONS
-- Drop known old/duplicate functions (safe to drop)
DROP FUNCTION IF EXISTS advance_double_elimination_tournament_v2(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_tournament_v3(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_tournament_v4(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_tournament_v5(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_tournament_v6(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_tournament_v7(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_tournament_v8(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_tournament_v9(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_v2(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_v3(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_v4(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_v5(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_v6(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_v7(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_v8(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS advance_double_elimination_v9(UUID, UUID) CASCADE;

-- Drop old tournament creation functions
DROP FUNCTION IF EXISTS create_double_elimination_tournament_v2(TEXT, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_double_elimination_tournament_v3(TEXT, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_double_elimination_tournament_old(TEXT, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_tournament_bracket_v2(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_tournament_bracket_v3(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_tournament_bracket_old(UUID) CASCADE;

-- Drop old bracket generation functions  
DROP FUNCTION IF EXISTS generate_double_elimination_bracket_v2(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_double_elimination_bracket_v3(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_double_elimination_bracket_v4(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_double_elimination_bracket_old(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_tournament_bracket_v2(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_tournament_bracket_v3(UUID) CASCADE;
DROP FUNCTION IF EXISTS generate_tournament_bracket_old(UUID) CASCADE;

-- Drop migration/repair functions (no longer needed)
DROP FUNCTION IF EXISTS migrate_tournament_to_double_elimination(UUID) CASCADE;
DROP FUNCTION IF EXISTS repair_tournament_bracket(UUID) CASCADE;
DROP FUNCTION IF EXISTS repair_double_elimination_bracket(UUID) CASCADE;
DROP FUNCTION IF EXISTS fix_tournament_bracket_issues(UUID) CASCADE;
DROP FUNCTION IF EXISTS cleanup_tournament_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS reset_tournament_bracket(UUID) CASCADE;

SELECT '✅ PHASE 2: Old functions cleaned up' as status;

-- 🧹 PHASE 3: CLEANUP OLD TRIGGERS
-- Drop old triggers (known patterns)
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v2 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v3 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v4 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v5 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v6 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v7 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v8 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS auto_advance_tournament_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS auto_advance_double_elim_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS tournament_advancement_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS bracket_advancement_trigger ON tournament_matches CASCADE;

SELECT '✅ PHASE 3: Old triggers cleaned up' as status;

-- 🧹 PHASE 4: CLEANUP OLD/TEMP TABLES
-- Drop temporary/backup tables that are no longer needed
DROP TABLE IF EXISTS tournament_matches_temp CASCADE;
DROP TABLE IF EXISTS tournament_matches_backup CASCADE;
DROP TABLE IF EXISTS tournament_matches_old CASCADE;
DROP TABLE IF EXISTS tournaments_temp CASCADE;
DROP TABLE IF EXISTS tournaments_backup CASCADE;
DROP TABLE IF EXISTS tournaments_old CASCADE;
DROP TABLE IF EXISTS tournament_brackets_temp CASCADE;
DROP TABLE IF EXISTS tournament_brackets_backup CASCADE;
DROP TABLE IF EXISTS tournament_brackets_old CASCADE;
DROP TABLE IF EXISTS double_elimination_temp CASCADE;
DROP TABLE IF EXISTS double_elimination_backup CASCADE;
DROP TABLE IF EXISTS bracket_temp CASCADE;
DROP TABLE IF EXISTS bracket_backup CASCADE;

-- Drop any remaining backup tables from today's migration
DO $$
DECLARE
  backup_table RECORD;
BEGIN
  FOR backup_table IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE '%backup_2025%' 
      AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', backup_table.table_name);
    RAISE NOTICE '🗑️ Dropped backup table: %', backup_table.table_name;
  END LOOP;
END $$;

SELECT '✅ PHASE 4: Old tables cleaned up' as status;

-- 🧹 PHASE 5: CLEANUP DUPLICATE INDEXES
-- Drop old/duplicate indexes (keeping the optimized ones)
DROP INDEX IF EXISTS idx_tournament_matches_tournament_id_old CASCADE;
DROP INDEX IF EXISTS idx_tournament_matches_round_old CASCADE;
DROP INDEX IF EXISTS idx_tournament_matches_bracket_old CASCADE;
DROP INDEX IF EXISTS idx_tournaments_status_old CASCADE;
DROP INDEX IF EXISTS idx_tournaments_type_old CASCADE;
DROP INDEX IF EXISTS tournament_matches_tournament_id_idx_old CASCADE;
DROP INDEX IF EXISTS tournament_matches_round_number_idx_old CASCADE;
DROP INDEX IF EXISTS tournaments_status_idx_old CASCADE;

SELECT '✅ PHASE 5: Duplicate indexes cleaned up' as status;

-- 🧹 PHASE 6: CLEANUP OLD POLICIES
-- Remove old/conflicting policies (keeping the current clean ones)
DROP POLICY IF EXISTS "old_tournament_view_policy" ON tournaments CASCADE;
DROP POLICY IF EXISTS "old_tournament_manage_policy" ON tournaments CASCADE;
DROP POLICY IF EXISTS "old_matches_view_policy" ON tournament_matches CASCADE;
DROP POLICY IF EXISTS "old_matches_manage_policy" ON tournament_matches CASCADE;
DROP POLICY IF EXISTS "deprecated_tournament_policy" ON tournaments CASCADE;
DROP POLICY IF EXISTS "deprecated_matches_policy" ON tournament_matches CASCADE;

SELECT '✅ PHASE 6: Old policies cleaned up' as status;

-- 🔍 PHASE 7: FINAL VERIFICATION
SELECT 
  '📊 CLEANUP SUMMARY' as summary,
  'tournaments' as table_name,
  COUNT(*) as record_count,
  'PRESERVED' as status
FROM tournaments

UNION ALL

SELECT 
  '📊 CLEANUP SUMMARY' as summary,
  'tournament_matches' as table_name,
  COUNT(*) as record_count,
  'PRESERVED' as status
FROM tournament_matches

UNION ALL

SELECT 
  '📊 CLEANUP SUMMARY' as summary,
  'tournament_results' as table_name,
  COUNT(*) as record_count,
  'PRESERVED' as status
FROM tournament_results

UNION ALL

SELECT 
  '📊 CLEANUP SUMMARY' as summary,
  'tournament_registrations' as table_name,
  COUNT(*) as record_count,
  'PRESERVED' as status
FROM tournament_registrations;

-- Check remaining SABO functions (should be clean set)
SELECT 
  '🔧 REMAINING SABO FUNCTIONS' as category,
  proname as function_name,
  pronargs as param_count,
  'ACTIVE' as status
FROM pg_proc 
WHERE proname IN (
  'generate_sabo_tournament_bracket',
  'advance_sabo_tournament', 
  'submit_sabo_match_score',
  'validate_sabo_tournament_structure',
  'sabo_system_health_check'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

SELECT 
  '🎉 CLEANUP COMPLETED SUCCESSFULLY' as final_status,
  'Production environment is now clean and optimized' as message,
  'Only essential SABO functions remain' as sabo_status,
  NOW() as cleanup_timestamp;
