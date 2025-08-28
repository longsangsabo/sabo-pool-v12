-- =============================================
-- REMOVE CONFLICTING TRIGGERS FROM TOURNAMENT_MATCHES
-- Based on actual schema provided by user
-- =============================================

-- Remove triggers that might cause conflicts with direct updates
DROP TRIGGER IF EXISTS sabo_auto_advancement ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS sabo_semifinals_auto_population ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trg_tournament_matches_after_update ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_tournament_results ON tournament_matches CASCADE;

-- Keep the update timestamp trigger (this one is safe)
-- DROP TRIGGER IF EXISTS update_sabo_matches_updated_at ON tournament_matches CASCADE;

-- Verify triggers are removed
SELECT 
    'Checking remaining triggers on tournament_matches' as status;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'tournament_matches'
ORDER BY trigger_name;

-- Show table structure for reference
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tournament_matches' 
ORDER BY ordinal_position;

SELECT 'Triggers cleaned - ready for safe direct updates' as result;
