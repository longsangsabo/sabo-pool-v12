-- ================================================================================
-- QUICK FIX: CHỈ SỬA APPROVE_RANK_REQUEST FUNCTION
-- ================================================================================
-- Script đơn giản để fix function gây lỗi ngay lập tức
-- ================================================================================

-- Drop function cũ FORCE
DROP FUNCTION IF EXISTS approve_rank_request(UUID, UUID, UUID) CASCADE;

-- Recreate với logic an toàn
CREATE OR REPLACE FUNCTION approve_rank_request(
  request_id UUID,
  approver_id UUID,
  club_id UUID
)
RETURNS JSONB AS $$
DECLARE
  request_record RECORD;
  v_user_id UUID;
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
  
  -- Handle player_rankings safely (NO ON CONFLICT)
  IF NOT EXISTS(SELECT 1 FROM player_rankings WHERE user_id = v_user_id) THEN
    INSERT INTO player_rankings (user_id, updated_at, created_at)
    VALUES (v_user_id, NOW(), NOW());
  ELSE
    UPDATE player_rankings SET updated_at = NOW() WHERE user_id = v_user_id;
  END IF;
  
  -- Update user's verified rank
  UPDATE profiles 
  SET verified_rank = request_record.requested_rank, updated_at = NOW()
  WHERE user_id = v_user_id;
  
  -- Handle club_members safely (NO ON CONFLICT)
  IF NOT EXISTS(SELECT 1 FROM club_members WHERE club_id = approve_rank_request.club_id AND user_id = v_user_id) THEN
    INSERT INTO club_members (club_id, user_id, join_date, status, created_at)
    VALUES (club_id, v_user_id, NOW(), 'active', NOW());
  ELSE
    UPDATE club_members SET status = 'active', updated_at = NOW()
    WHERE club_id = approve_rank_request.club_id AND user_id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Rank request approved successfully',
    'user_id', v_user_id,
    'approved_rank', request_record.requested_rank
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'error_detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION approve_rank_request(UUID, UUID, UUID) TO authenticated;

-- Test message
DO $$
BEGIN
    RAISE NOTICE '✅ APPROVE_RANK_REQUEST FUNCTION FIXED!';
    RAISE NOTICE 'Function now uses IF EXISTS instead of ON CONFLICT';
    RAISE NOTICE 'Error should be resolved immediately.';
END $$;
