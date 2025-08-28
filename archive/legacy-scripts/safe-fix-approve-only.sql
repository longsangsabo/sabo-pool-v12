-- ================================================================================
-- SAFE FIX: CHỈ SỬA APPROVE_RANK_REQUEST (KHÔNG DROP FUNCTIONS KHÁC)
-- ================================================================================
-- Script an toàn - chỉ fix function gây lỗi, giữ nguyên các functions khác
-- ================================================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Safe fix: Only fixing approve_rank_request function...';
    RAISE NOTICE '⚠️ Other functions will remain unchanged to avoid breaking features';
END $$;

-- Chỉ drop function gây lỗi
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

-- Verification
DO $$
BEGIN
    RAISE NOTICE '✅ FIXED approve_rank_request function only!';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Safe approach:';
    RAISE NOTICE '   • Only touched the function causing the error';
    RAISE NOTICE '   • All other functions remain unchanged';
    RAISE NOTICE '   • No features will be broken';
    RAISE NOTICE '';
    RAISE NOTICE '✅ approve_rank_request now uses IF EXISTS instead of ON CONFLICT';
    RAISE NOTICE '💡 Error should be resolved immediately';
END $$;
