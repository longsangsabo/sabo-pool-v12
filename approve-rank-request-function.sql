-- SQL Script to create approve_rank_request function
-- Run this in Supabase Dashboard > SQL Editor

CREATE OR REPLACE FUNCTION approve_rank_request(
  request_id UUID,
  approver_id UUID,
  club_id UUID
)
RETURNS JSONB AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Check if request exists and is pending
  SELECT * INTO request_record 
  FROM rank_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  -- Skip permission check - if user can access club-management, they are owner
  
  -- Update rank request
  UPDATE rank_requests 
  SET 
    status = 'approved',
    approved_by = approver_id,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Ensure player_rankings record exists
  INSERT INTO player_rankings (user_id, updated_at)
  VALUES (request_record.user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();
  
  -- Update user's verified rank
  UPDATE profiles 
  SET verified_rank = request_record.requested_rank
  WHERE user_id = request_record.user_id;
  
  -- Add user to club_members (status can be null, that's fine)
  INSERT INTO club_members (club_id, user_id, join_date, status)
  VALUES (club_id, request_record.user_id, NOW(), NULL)
  ON CONFLICT DO NOTHING;
  
  RETURN jsonb_build_object('success', true, 'message', 'Rank request approved successfully');
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION approve_rank_request(UUID, UUID, UUID) TO authenticated;
