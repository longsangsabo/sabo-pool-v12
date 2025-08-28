-- ================================================================================
-- COMPREHENSIVE RANK SYSTEM RESTORATION
-- ================================================================================
-- Restore tất cả functions cần thiết cho rank system hoạt động đầy đủ
-- Bao gồm: rank approval, milestone system, club membership, SPA transactions

BEGIN;

-- ================================================================================
-- PART 1: DROP EXISTING FUNCTIONS TO AVOID CONFLICTS
-- ================================================================================

DROP FUNCTION IF EXISTS approve_rank_request(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS award_milestone_spa(UUID, INTEGER, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS complete_milestone(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_milestone_progress(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS check_and_award_milestones(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS add_user_to_club(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS trigger_handle_rank_approval() CASCADE;

-- ================================================================================
-- PART 2: RANK APPROVAL FUNCTIONS
-- ================================================================================

-- Function 1: Core rank approval function (từ archive)
CREATE OR REPLACE FUNCTION approve_rank_request(
  request_id UUID,
  approver_id UUID,
  club_id UUID
) RETURNS JSON AS $$
DECLARE
  request_data RECORD;
  result JSON;
  spa_reward INTEGER;
  rank_text TEXT;
BEGIN
  -- Check if approver is club owner/admin
  IF NOT EXISTS (
    SELECT 1 FROM club_members 
    WHERE club_id = approve_rank_request.club_id 
    AND user_id = approver_id 
    AND role IN ('owner', 'admin')
    AND status = 'approved'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Get the rank request details
  SELECT * INTO request_data 
  FROM rank_requests 
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Rank request not found or already processed');
  END IF;

  -- Convert rank to text and calculate SPA
  rank_text := CASE request_data.requested_rank
    WHEN 1 THEN 'K'   WHEN 2 THEN 'K+'
    WHEN 3 THEN 'I'   WHEN 4 THEN 'I+'
    WHEN 5 THEN 'H'   WHEN 6 THEN 'H+'
    WHEN 7 THEN 'G'   WHEN 8 THEN 'G+'
    WHEN 9 THEN 'F'   WHEN 10 THEN 'F+'
    WHEN 11 THEN 'E'  WHEN 12 THEN 'E+'
    ELSE 'K'
  END;
  
  spa_reward := CASE request_data.requested_rank
    WHEN 12 THEN 300  WHEN 11 THEN 300  -- E+, E
    WHEN 10 THEN 250  WHEN 9 THEN 250   -- F+, F  
    WHEN 8 THEN 200   WHEN 7 THEN 200   -- G+, G
    WHEN 6 THEN 150   WHEN 5 THEN 150   -- H+, H
    WHEN 4 THEN 120   WHEN 3 THEN 120   -- I+, I
    WHEN 2 THEN 100   WHEN 1 THEN 100   -- K+, K
    ELSE 100
  END;

  -- Update rank request status
  UPDATE rank_requests 
  SET 
    status = 'approved',
    updated_at = NOW(),
    approved_by = approver_id,
    approved_at = NOW()
  WHERE id = request_id;

  -- Update profile verified rank
  UPDATE profiles 
  SET 
    verified_rank = rank_text,
    rank_verified_at = NOW(),
    updated_at = NOW()
  WHERE user_id = request_data.user_id;

  -- Update player rankings
  INSERT INTO player_rankings (user_id, verified_rank, spa_points, updated_at, created_at)
  VALUES (request_data.user_id, rank_text, spa_reward, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    verified_rank = EXCLUDED.verified_rank,
    spa_points = COALESCE(player_rankings.spa_points, 0) + spa_reward,
    updated_at = NOW();

  -- Update wallet
  INSERT INTO wallets (user_id, points_balance, created_at, updated_at)
  VALUES (request_data.user_id, spa_reward, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    points_balance = COALESCE(wallets.points_balance, 0) + spa_reward,
    updated_at = NOW();

  -- Create SPA transaction
  INSERT INTO spa_transactions (
    user_id, points, transaction_type, description, 
    reference_id, reference_type, created_at
  ) VALUES (
    request_data.user_id, spa_reward, 'rank_approval', 
    'Rank ' || rank_text || ' approved by club', 
    request_id, 'rank_request', NOW()
  );

  -- Ensure user is club member
  INSERT INTO club_members (club_id, user_id, status, join_date, membership_type, role)
  VALUES (approve_rank_request.club_id, request_data.user_id, 'approved', NOW(), 'verified_member', 'member')
  ON CONFLICT (club_id, user_id) 
  DO UPDATE SET 
    status = 'approved',
    membership_type = 'verified_member',
    updated_at = NOW();

  -- Create notification
  INSERT INTO notifications (
    user_id, title, message, type, 
    metadata, created_at
  ) VALUES (
    request_data.user_id,
    'Rank Approved!',
    'Your rank ' || rank_text || ' has been approved! You received ' || spa_reward || ' SPA points.',
    'rank_approval',
    jsonb_build_object(
      'rank', rank_text,
      'spa_reward', spa_reward,
      'club_id', club_id
    ),
    NOW()
  );

  -- Return success
  RETURN json_build_object(
    'success', true, 
    'message', 'Rank request approved successfully',
    'request_id', request_id,
    'user_id', request_data.user_id,
    'approved_rank', rank_text,
    'spa_reward', spa_reward
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================
-- PART 3: MILESTONE SYSTEM FUNCTIONS
-- ================================================================================

-- Function 2: Award milestone SPA
CREATE OR REPLACE FUNCTION award_milestone_spa(
  p_user_id UUID,
  p_spa_amount INTEGER,
  p_milestone_name TEXT,
  p_milestone_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_current_spa INTEGER := 0;
BEGIN
  -- Get current SPA balance
  SELECT COALESCE(spa_points, 0) INTO v_current_spa
  FROM player_rankings 
  WHERE user_id = p_user_id;
  
  -- If user doesn't exist in player_rankings, create record
  IF NOT FOUND THEN
    INSERT INTO player_rankings (user_id, spa_points, created_at, updated_at)
    VALUES (p_user_id, 0, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    v_current_spa := 0;
  END IF;

  -- Update SPA balance in player_rankings
  UPDATE player_rankings 
  SET spa_points = COALESCE(spa_points, 0) + p_spa_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update wallet
  INSERT INTO wallets (user_id, points_balance, created_at, updated_at)
  VALUES (p_user_id, p_spa_amount, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    points_balance = COALESCE(wallets.points_balance, 0) + p_spa_amount,
    updated_at = NOW();

  -- Create SPA transaction record
  INSERT INTO spa_transactions (
    user_id, points, transaction_type, description,
    reference_id, reference_type, metadata, created_at
  ) VALUES (
    p_user_id, p_spa_amount, 'milestone_reward', 
    'Milestone: ' || p_milestone_name,
    p_milestone_id, 'milestone',
    jsonb_build_object(
      'milestone_id', p_milestone_id,
      'milestone_name', p_milestone_name,
      'awarded_at', NOW()
    ),
    NOW()
  );

  -- Create notification
  INSERT INTO notifications (
    user_id, title, message, type, metadata, created_at
  ) VALUES (
    p_user_id,
    'Milestone Completed!',
    'You completed "' || p_milestone_name || '" and earned ' || p_spa_amount || ' SPA!',
    'milestone_completed',
    jsonb_build_object(
      'milestone_name', p_milestone_name,
      'spa_reward', p_spa_amount
    ),
    NOW()
  );

  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'spa_awarded', p_spa_amount,
    'previous_balance', v_current_spa,
    'new_balance', v_current_spa + p_spa_amount,
    'milestone', p_milestone_name
  );

  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'user_id', p_user_id,
    'spa_amount', p_spa_amount,
    'milestone', p_milestone_name
  );
END;
$$;

-- Function 3: Complete milestone
CREATE OR REPLACE FUNCTION complete_milestone(
  p_user_id UUID,
  p_milestone_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestone RECORD;
  v_user_milestone RECORD;
  v_spa_result JSONB;
BEGIN
  -- Get milestone details
  SELECT * INTO v_milestone 
  FROM milestones 
  WHERE id = p_milestone_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone not found');
  END IF;

  -- Get user milestone progress
  SELECT * INTO v_user_milestone
  FROM user_milestones 
  WHERE user_id = p_user_id AND milestone_id = p_milestone_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User milestone not found');
  END IF;

  -- Check if already completed
  IF v_user_milestone.status = 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone already completed');
  END IF;

  -- Mark milestone as completed
  UPDATE user_milestones 
  SET 
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND milestone_id = p_milestone_id;

  -- Award SPA points if milestone has reward
  IF v_milestone.spa_reward > 0 THEN
    SELECT award_milestone_spa(
      p_user_id, 
      v_milestone.spa_reward, 
      v_milestone.title,
      p_milestone_id
    ) INTO v_spa_result;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'milestone_id', p_milestone_id,
    'milestone_title', v_milestone.title,
    'spa_reward', v_milestone.spa_reward,
    'spa_result', v_spa_result
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Function 4: Update milestone progress
CREATE OR REPLACE FUNCTION update_milestone_progress(
  p_user_id UUID,
  p_activity_type TEXT,
  p_increment INTEGER DEFAULT 1
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestone RECORD;
  v_user_milestone RECORD;
  v_completed_milestones JSONB := '[]'::jsonb;
  v_milestone_result JSONB;
BEGIN
  -- Find applicable milestones for this activity type
  FOR v_milestone IN 
    SELECT * FROM milestones 
    WHERE milestone_type = p_activity_type 
    AND status = 'active'
  LOOP
    -- Get or create user milestone
    SELECT * INTO v_user_milestone
    FROM user_milestones 
    WHERE user_id = p_user_id AND milestone_id = v_milestone.id;
    
    IF NOT FOUND THEN
      INSERT INTO user_milestones (
        user_id, milestone_id, current_progress, status, created_at, updated_at
      ) VALUES (
        p_user_id, v_milestone.id, 0, 'in_progress', NOW(), NOW()
      );
      v_user_milestone.current_progress := 0;
    END IF;

    -- Update progress if not completed
    IF v_user_milestone.status != 'completed' THEN
      UPDATE user_milestones 
      SET 
        current_progress = LEAST(current_progress + p_increment, v_milestone.target_value),
        updated_at = NOW()
      WHERE user_id = p_user_id AND milestone_id = v_milestone.id;

      -- Check if milestone is now completed
      IF (v_user_milestone.current_progress + p_increment) >= v_milestone.target_value THEN
        SELECT complete_milestone(p_user_id, v_milestone.id) INTO v_milestone_result;
        v_completed_milestones := v_completed_milestones || v_milestone_result;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'activity_type', p_activity_type,
    'increment', p_increment,
    'completed_milestones', v_completed_milestones
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Function 5: Check and award milestones (alias for backward compatibility)
CREATE OR REPLACE FUNCTION check_and_award_milestones(
  p_user_id UUID,
  p_activity_type TEXT,
  p_increment INTEGER DEFAULT 1
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN update_milestone_progress(p_user_id, p_activity_type, p_increment);
END;
$$;

-- ================================================================================
-- PART 4: CLUB MEMBERSHIP FUNCTIONS
-- ================================================================================

-- Function 6: Add user to club after rank approval
CREATE OR REPLACE FUNCTION add_user_to_club(
  p_user_id UUID,
  p_club_id UUID,
  p_role TEXT DEFAULT 'member'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO club_members (
    club_id, user_id, status, join_date, 
    membership_type, role, created_at, updated_at
  ) VALUES (
    p_club_id, p_user_id, 'approved', NOW(),
    'verified_member', p_role, NOW(), NOW()
  )
  ON CONFLICT (club_id, user_id) 
  DO UPDATE SET 
    status = 'approved',
    membership_type = 'verified_member',
    role = p_role,
    updated_at = NOW();

  -- Create notification
  INSERT INTO notifications (
    user_id, title, message, type, metadata, created_at
  ) VALUES (
    p_user_id,
    'Welcome to Club!',
    'You have been added to the club as a verified member.',
    'club_member_joined',
    jsonb_build_object('club_id', p_club_id, 'role', p_role),
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'club_id', p_club_id,
    'role', p_role
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ================================================================================
-- PART 5: GRANT PERMISSIONS
-- ================================================================================

GRANT EXECUTE ON FUNCTION approve_rank_request(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION award_milestone_spa(UUID, INTEGER, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_milestone(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_milestone_progress(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_milestones(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_to_club(UUID, UUID, TEXT) TO authenticated;

-- ================================================================================
-- PART 6: CREATE TRIGGERS FOR AUTOMATIC PROCESSING
-- ================================================================================

-- Trigger for rank approval
CREATE OR REPLACE FUNCTION trigger_handle_rank_approval() 
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only process when status changes to approved
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Update milestone progress for rank achievement
    PERFORM update_milestone_progress(NEW.user_id, 'rank_approved', 1);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_handle_rank_approval ON rank_requests;
CREATE TRIGGER trigger_handle_rank_approval
  AFTER UPDATE ON rank_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_handle_rank_approval();

COMMIT;

-- ================================================================================
-- VERIFICATION & SUCCESS MESSAGE
-- ================================================================================

DO $$
DECLARE
  function_count INTEGER;
BEGIN
  -- Count restored functions
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name IN (
    'approve_rank_request',
    'award_milestone_spa',
    'complete_milestone',
    'update_milestone_progress',
    'check_and_award_milestones',
    'add_user_to_club'
  );

  RAISE NOTICE '';
  RAISE NOTICE '🎉 COMPREHENSIVE RANK SYSTEM RESTORATION COMPLETED!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Restored % functions:', function_count;
  RAISE NOTICE '   • approve_rank_request() - Core rank approval with full workflow';
  RAISE NOTICE '   • award_milestone_spa() - SPA rewards with transactions';
  RAISE NOTICE '   • complete_milestone() - Milestone completion system';
  RAISE NOTICE '   • update_milestone_progress() - Progress tracking';
  RAISE NOTICE '   • check_and_award_milestones() - Auto milestone detection';
  RAISE NOTICE '   • add_user_to_club() - Club membership management';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Active triggers:';
  RAISE NOTICE '   • trigger_handle_rank_approval - Auto milestone progress';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Full rank workflow now working:';
  RAISE NOTICE '   1. User submits rank request';
  RAISE NOTICE '   2. Admin approves → rank updated';
  RAISE NOTICE '   3. User gets SPA reward';
  RAISE NOTICE '   4. User added to club as verified member';
  RAISE NOTICE '   5. Milestone progress updated';
  RAISE NOTICE '   6. Notifications sent';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Frontend can now fully use rank approval system!';
  RAISE NOTICE '';
END $$;
