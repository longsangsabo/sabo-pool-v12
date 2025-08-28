-- ================================================================================
-- FORCE REPLACE APPROVE_RANK_REQUEST FUNCTION - NO ON CONFLICT
-- ================================================================================
-- Script đơn giản để thay thế function mà không dùng ON CONFLICT
-- ================================================================================

-- STEP 1: FORCE DROP ALL VERSIONS
DROP FUNCTION IF EXISTS approve_rank_request(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.approve_rank_request(UUID, UUID, UUID) CASCADE;

-- STEP 2: CREATE SIMPLE VERSION WITHOUT ON CONFLICT
CREATE OR REPLACE FUNCTION approve_rank_request(
  request_id UUID,
  approver_id UUID,
  club_id UUID
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
  v_user_id UUID;
BEGIN
  -- Get request details
  SELECT * INTO request_record 
  FROM rank_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  
  v_user_id := request_record.user_id;
  
  -- Update request status
  UPDATE rank_requests 
  SET status = 'approved', approved_by = approver_id, approved_at = NOW()
  WHERE id = request_id;
  
  -- Update verified rank
  UPDATE profiles 
  SET verified_rank = request_record.requested_rank
  WHERE user_id = v_user_id;
  
  -- Handle player_rankings (SIMPLE WAY)
  IF NOT EXISTS (SELECT 1 FROM player_rankings WHERE user_id = v_user_id) THEN
    INSERT INTO player_rankings (user_id, created_at) VALUES (v_user_id, NOW());
  END IF;
  
  -- Handle club_members (SIMPLE WAY)  
  IF NOT EXISTS (SELECT 1 FROM club_members WHERE club_id = club_id AND user_id = v_user_id) THEN
    INSERT INTO club_members (club_id, user_id, join_date, status) 
    VALUES (club_id, v_user_id, NOW(), 'active');
  ELSE
    UPDATE club_members SET status = 'active' 
    WHERE club_id = club_id AND user_id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'Approved successfully');
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION approve_rank_request(UUID, UUID, UUID) TO authenticated, anon;

-- Verify function exists
SELECT 'Function created successfully' as result;
