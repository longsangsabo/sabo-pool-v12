-- =============================================
-- CLEAN UP CONFLICTING TOURNAMENT FUNCTIONS ONLY
-- Xóa function gây ON CONFLICT, giữ lại advancement logic
-- Approach: Safe Direct Update + Client-side Advancement
-- =============================================

-- STEP 1: Drop only the conflicting functions
DROP FUNCTION IF EXISTS submit_match_score(uuid, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS submit_sabo_match_score(uuid, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS update_match_score(uuid, integer, integer) CASCADE;

-- STEP 2: Drop conflicting triggers (keeping essential ones)
DROP TRIGGER IF EXISTS tournament_advancement_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS match_completion_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS score_update_trigger ON tournament_matches CASCADE;

-- STEP 3: Keep beneficial functions (if any exist)
-- These are safe to keep:
-- - Functions that don't cause ON CONFLICT
-- - Read-only functions for analytics
-- - Helper functions for tournament management

-- STEP 4: Verify table is ready for safe direct updates
SELECT 
    'tournament_matches ready for safe direct updates' as status,
    COUNT(*) as total_matches,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_matches,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_matches
FROM tournament_matches;

-- STEP 5: Show remaining constraints (should be minimal)
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'tournament_matches'
  AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
ORDER BY tc.constraint_type, tc.constraint_name;

-- STEP 6: Verify no conflicting triggers remain
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'tournament_matches';

-- SUCCESS MESSAGE
SELECT 'Tournament functions cleaned - ready for safe direct updates with client-side advancement' as result;
