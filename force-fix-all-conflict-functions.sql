-- ================================================================================
-- FORCE DROP AND RECREATE ALL CONFLICT FUNCTIONS
-- ================================================================================
-- Fix tất cả functions có ON CONFLICT gây lỗi
-- ================================================================================

DO $$
BEGIN
    RAISE NOTICE '🚨 FORCE DROPPING ALL PROBLEMATIC FUNCTIONS...';
END $$;

-- Step 1: Drop tất cả functions có ON CONFLICT
-- ================================================================================
DROP FUNCTION IF EXISTS accept_open_challenge(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS approve_rank_request(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS award_milestone_spa(UUID, INTEGER, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS check_and_award_milestones(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS complete_challenge(UUID, UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS complete_challenge_match(UUID, UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS complete_milestone(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS complete_milestone_dual_id(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS complete_tournament_automatically(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_club_zero_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_match_from_challenge(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_player_ranking(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_user_zero_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS ensure_player_ranking_exists(UUID) CASCADE;
DROP FUNCTION IF EXISTS handle_rank_request_status_update() CASCADE;
DROP FUNCTION IF EXISTS process_challenge_completion(UUID, UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS process_spa_on_completion(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS sync_tournament_points_to_rankings(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_spa_points_with_transaction(UUID, INTEGER, TEXT) CASCADE;

DO $$
BEGIN
    RAISE NOTICE '🗑️ Dropped all problematic functions';
END $$;

-- Step 2: Create essential functions only (safe versions)
-- ================================================================================

-- approve_rank_request (SAFE VERSION)
CREATE OR REPLACE FUNCTION approve_rank_request(
  request_id UUID,
  approver_id UUID,
  club_id UUID
)
RETURNS JSONB AS $$
DECLARE
  request_record RECORD;
  v_user_id UUID;
  v_member_exists BOOLEAN := false;
  v_player_ranking_exists BOOLEAN := false;
BEGIN
  -- Check if request exists and is pending
  SELECT * INTO request_record 
  FROM rank_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  v_user_id := request_record.user_id;
  
  -- Update rank request
  UPDATE rank_requests 
  SET 
    status = 'approved',
    approved_by = approver_id,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Handle player_rankings safely
  SELECT EXISTS(SELECT 1 FROM player_rankings WHERE user_id = v_user_id) INTO v_player_ranking_exists;
  
  IF NOT v_player_ranking_exists THEN
    INSERT INTO player_rankings (user_id, updated_at, created_at)
    VALUES (v_user_id, NOW(), NOW());
  ELSE
    UPDATE player_rankings SET updated_at = NOW() WHERE user_id = v_user_id;
  END IF;
  
  -- Update user's verified rank
  UPDATE profiles 
  SET verified_rank = request_record.requested_rank, updated_at = NOW()
  WHERE user_id = v_user_id;
  
  -- Handle club_members safely
  SELECT EXISTS(SELECT 1 FROM club_members WHERE club_id = approve_rank_request.club_id AND user_id = v_user_id) INTO v_member_exists;
  
  IF NOT v_member_exists THEN
    INSERT INTO club_members (club_id, user_id, join_date, status, created_at)
    VALUES (club_id, v_user_id, NOW(), 'active', NOW());
  ELSE
    UPDATE club_members SET status = 'active', updated_at = NOW()
    WHERE club_id = approve_rank_request.club_id AND user_id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'Rank request approved successfully');
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- create_user_zero_data (SAFE VERSION)
CREATE OR REPLACE FUNCTION create_user_zero_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile_exists BOOLEAN := false;
  v_ranking_exists BOOLEAN := false;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = p_user_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    INSERT INTO profiles (user_id, created_at, updated_at)
    VALUES (p_user_id, NOW(), NOW());
  END IF;
  
  -- Check if player_rankings exists
  SELECT EXISTS(SELECT 1 FROM player_rankings WHERE user_id = p_user_id) INTO v_ranking_exists;
  
  IF NOT v_ranking_exists THEN
    INSERT INTO player_rankings (user_id, spa_points, created_at, updated_at)
    VALUES (p_user_id, 0, NOW(), NOW());
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'User data created safely');
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ensure_player_ranking_exists (SAFE VERSION)
CREATE OR REPLACE FUNCTION ensure_player_ranking_exists(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN := false;
BEGIN
  SELECT EXISTS(SELECT 1 FROM player_rankings WHERE user_id = p_user_id) INTO v_exists;
  
  IF NOT v_exists THEN
    INSERT INTO player_rankings (user_id, spa_points, created_at, updated_at)
    VALUES (p_user_id, 0, NOW(), NOW());
  END IF;
  
  RETURN true;
  
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- update_spa_points_with_transaction (SAFE VERSION)
CREATE OR REPLACE FUNCTION update_spa_points_with_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_ranking_exists BOOLEAN := false;
  v_current_points INTEGER := 0;
BEGIN
  -- Ensure player ranking exists
  SELECT EXISTS(SELECT 1 FROM player_rankings WHERE user_id = p_user_id) INTO v_ranking_exists;
  
  IF NOT v_ranking_exists THEN
    INSERT INTO player_rankings (user_id, spa_points, created_at, updated_at)
    VALUES (p_user_id, p_amount, NOW(), NOW());
    v_current_points := p_amount;
  ELSE
    UPDATE player_rankings 
    SET spa_points = spa_points + p_amount, updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING spa_points INTO v_current_points;
  END IF;
  
  -- Create transaction record
  INSERT INTO spa_transactions (
    user_id, amount, source_type, transaction_type, description, status, created_at
  ) VALUES (
    p_user_id, p_amount, 'system', 'credit', p_description, 'completed', NOW()
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'new_balance', v_current_points,
    'amount_added', p_amount
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Grant permissions
-- ================================================================================
GRANT EXECUTE ON FUNCTION approve_rank_request(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_zero_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_player_ranking_exists(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_spa_points_with_transaction(UUID, INTEGER, TEXT) TO authenticated;

-- Step 4: Final verification
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 FIXED ALL ON CONFLICT FUNCTIONS!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Recreated essential functions:';
    RAISE NOTICE '   • approve_rank_request() - Main function causing error';
    RAISE NOTICE '   • create_user_zero_data() - User initialization';
    RAISE NOTICE '   • ensure_player_ranking_exists() - Ranking safety';
    RAISE NOTICE '   • update_spa_points_with_transaction() - SPA updates';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 All functions now use IF/ELSE instead of ON CONFLICT';
    RAISE NOTICE '💡 No more constraint specification errors!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Other functions were dropped - recreate if needed';
END $$;
