-- BƯỚC 1: XÓA TẤT CẢ FUNCTIONS CŨ
-- Chạy từng function một để đảm bảo cleanup hoàn toàn

-- 1. Challenge acceptance functions
DROP FUNCTION IF EXISTS accept_challenge CASCADE;
DROP FUNCTION IF EXISTS accept_challenge_emergency_workaround CASCADE;
DROP FUNCTION IF EXISTS accept_open_challenge CASCADE;
DROP FUNCTION IF EXISTS accept_open_challenge_fixed CASCADE;
DROP FUNCTION IF EXISTS accept_open_challenge_simple CASCADE;

-- 2. Challenge completion functions  
DROP FUNCTION IF EXISTS complete_challenge CASCADE;
DROP FUNCTION IF EXISTS complete_challenge_match CASCADE;
DROP FUNCTION IF EXISTS complete_challenge_match_with_bonuses CASCADE;
DROP FUNCTION IF EXISTS process_challenge_completion CASCADE;
DROP FUNCTION IF EXISTS process_challenge_result CASCADE;
DROP FUNCTION IF EXISTS process_challenge_spa_transfer CASCADE;

-- 3. Challenge creation and management
DROP FUNCTION IF EXISTS create_challenge CASCADE;
DROP FUNCTION IF EXISTS create_match_from_accepted_challenge CASCADE;
DROP FUNCTION IF EXISTS create_match_from_challenge CASCADE;
DROP FUNCTION IF EXISTS get_challenge_config CASCADE;
DROP FUNCTION IF EXISTS update_challenge_status CASCADE;
DROP FUNCTION IF EXISTS update_challenge_status_bypass CASCADE;

-- 4. Challenge automation and cleanup
DROP FUNCTION IF EXISTS auto_cleanup_expired_challenges CASCADE;
DROP FUNCTION IF EXISTS auto_transition_challenge_status CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_challenges CASCADE;

-- 5. Challenge calculations and rankings
DROP FUNCTION IF EXISTS calculate_challenge_spa CASCADE;
DROP FUNCTION IF EXISTS recalculate_all_challenge_ranks CASCADE;
DROP FUNCTION IF EXISTS update_challenge_ranks_on_accept CASCADE;
DROP FUNCTION IF EXISTS validate_challenge_spa_balance CASCADE;

-- 6. Challenge notifications
DROP FUNCTION IF EXISTS send_challenge_acceptance_notifications CASCADE;
DROP FUNCTION IF EXISTS simple_challenge_notification CASCADE;
DROP FUNCTION IF EXISTS trigger_challenge_notification CASCADE;

-- 7. Challenge triggers
DROP FUNCTION IF EXISTS admin_fix_challenges_trigger CASCADE;
DROP FUNCTION IF EXISTS simple_challenge_trigger CASCADE;
DROP FUNCTION IF EXISTS tf_challenge_completed CASCADE;
DROP FUNCTION IF EXISTS trg_challenge_matches_before_update CASCADE;
DROP FUNCTION IF EXISTS trigger_challenge_status_changed_new CASCADE;
DROP FUNCTION IF EXISTS update_challenge_matches_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_challenges_updated_at CASCADE;

-- 8. Drop test function
DROP FUNCTION IF EXISTS test_rebuild_connection CASCADE;

-- Verification: Check remaining functions
SELECT 'FUNCTIONS REMAINING:' as status;
SELECT proname FROM pg_proc WHERE proname LIKE '%challenge%' ORDER BY proname;
