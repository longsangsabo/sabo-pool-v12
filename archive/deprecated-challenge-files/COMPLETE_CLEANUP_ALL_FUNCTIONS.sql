-- PHASE 2: CLEAN DROP STRATEGY - THEO ĐÚNG PLAN
-- ===============================================

-- Step 1: Drop ALL triggers first (theo đúng plan)
DROP TRIGGER IF EXISTS club_confirmation_trigger ON challenges CASCADE;
DROP TRIGGER IF EXISTS spa_transfer_trigger ON challenges CASCADE;
DROP TRIGGER IF EXISTS challenge_status_update ON challenges CASCADE;
DROP TRIGGER IF EXISTS challenge_created_notification ON challenges CASCADE;
DROP TRIGGER IF EXISTS challenge_notification_trigger ON challenges CASCADE;
DROP TRIGGER IF EXISTS simple_challenge_trigger ON challenges CASCADE;
DROP TRIGGER IF EXISTS trigger_challenge_status_changed_new ON challenges CASCADE;
DROP TRIGGER IF EXISTS tf_challenge_completed ON challenges CASCADE;
DROP TRIGGER IF EXISTS trg_challenge_matches_before_update ON challenges CASCADE;
DROP TRIGGER IF EXISTS update_challenge_matches_updated_at ON challenges CASCADE;
DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges CASCADE;

-- Step 2: Drop ALL trigger functions
DROP FUNCTION IF EXISTS process_club_confirmation() CASCADE;
DROP FUNCTION IF EXISTS process_spa_on_completion() CASCADE; 
DROP FUNCTION IF EXISTS update_challenge_status() CASCADE;
DROP FUNCTION IF EXISTS notify_challenge_created() CASCADE;
DROP FUNCTION IF EXISTS admin_fix_challenges_trigger() CASCADE;
DROP FUNCTION IF EXISTS simple_challenge_trigger() CASCADE;
DROP FUNCTION IF EXISTS trigger_challenge_status_changed_new() CASCADE;
DROP FUNCTION IF EXISTS tf_challenge_completed() CASCADE;
DROP FUNCTION IF EXISTS trg_challenge_matches_before_update() CASCADE;
DROP FUNCTION IF EXISTS update_challenge_matches_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_challenges_updated_at() CASCADE;

-- Step 3: Drop ALL challenge management functions (từ list đã biết)
DROP FUNCTION IF EXISTS accept_open_challenge CASCADE;
DROP FUNCTION IF EXISTS accept_challenge CASCADE;
DROP FUNCTION IF EXISTS accept_challenge_emergency_workaround CASCADE;
DROP FUNCTION IF EXISTS accept_open_challenge_fixed CASCADE;
DROP FUNCTION IF EXISTS accept_open_challenge_simple CASCADE;
DROP FUNCTION IF EXISTS admin_create_challenge CASCADE;
DROP FUNCTION IF EXISTS create_challenge CASCADE;
DROP FUNCTION IF EXISTS create_challenge_safe CASCADE;
DROP FUNCTION IF EXISTS complete_challenge CASCADE;
DROP FUNCTION IF EXISTS complete_challenge_match CASCADE;
DROP FUNCTION IF EXISTS complete_challenge_match_with_bonuses CASCADE;
DROP FUNCTION IF EXISTS auto_cleanup_expired_challenges CASCADE;
DROP FUNCTION IF EXISTS auto_transition_challenge_status CASCADE;
DROP FUNCTION IF EXISTS calculate_challenge_spa CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_challenges CASCADE;
DROP FUNCTION IF EXISTS create_match_from_accepted_challenge CASCADE;
DROP FUNCTION IF EXISTS create_match_from_challenge CASCADE;
DROP FUNCTION IF EXISTS get_challenge_config CASCADE;
DROP FUNCTION IF EXISTS process_challenge_completion CASCADE;
DROP FUNCTION IF EXISTS process_challenge_result CASCADE;
DROP FUNCTION IF EXISTS process_challenge_spa_transfer CASCADE;
DROP FUNCTION IF EXISTS recalculate_all_challenge_ranks CASCADE;
DROP FUNCTION IF EXISTS send_challenge_acceptance_notifications CASCADE;
DROP FUNCTION IF EXISTS simple_challenge_notification CASCADE;
DROP FUNCTION IF EXISTS trigger_challenge_notification CASCADE;
DROP FUNCTION IF EXISTS update_challenge_ranks_on_accept CASCADE;
DROP FUNCTION IF EXISTS update_challenge_status_bypass CASCADE;
DROP FUNCTION IF EXISTS validate_challenge_spa_balance CASCADE;

-- Step 4: Verify clean state
SELECT 'All challenge functions and triggers dropped!' as status;

-- List remaining functions to verify
SELECT proname 
FROM pg_proc 
WHERE proname LIKE '%challenge%' 
ORDER BY proname;
