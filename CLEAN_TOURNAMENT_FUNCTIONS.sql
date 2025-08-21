-- ============================================================================
-- 🧹 CLEAN UP TOURNAMENT FUNCTIONS & TRIGGERS
-- Drop tất cả functions và triggers có thể gây conflict
-- ============================================================================

-- 1. DROP ALL TRIGGERS FIRST
DROP TRIGGER IF EXISTS trigger_auto_tournament_results ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS sabo_semifinals_auto_population ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_sabo_match_completion ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS sabo_auto_advancement ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS sabo_clean_advancement_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS tournament_matches_updated_at ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS spa_transfer_trigger ON challenges CASCADE;

-- 2. DROP ALL TOURNAMENT-RELATED FUNCTIONS
DROP FUNCTION IF EXISTS submit_sabo_match_score(UUID, INTEGER, INTEGER, UUID) CASCADE;
DROP FUNCTION IF EXISTS submit_sabo_match_score(UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS advance_sabo_tournament(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_and_insert_tournament_results() CASCADE;
DROP FUNCTION IF EXISTS manual_complete_tournament(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_and_insert_tournament_results_manual(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS test_tournament_results_trigger(UUID) CASCADE;
DROP FUNCTION IF EXISTS assign_participant_to_next_match(UUID, INTEGER, UUID) CASCADE;

-- 3. DROP HELPER FUNCTIONS
DROP FUNCTION IF EXISTS get_tournament_champion_prize(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_tournament_total_positions(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_tournaments_updated_at() CASCADE;

-- Verify cleanup
SELECT '🧹 All tournament functions and triggers dropped successfully!' as cleanup_status;
