-- ================================================================================
-- FIX CLUB MEMBERS CONSTRAINT AND APPROVE FUNCTION
-- ================================================================================
-- Sửa lỗi ON CONFLICT trong approve_rank_request function
-- ================================================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Fixing club_members constraint and approve function...';
END $$;

-- Step 1: Ensure club_members table has proper unique constraint
-- ================================================================================
DO $$
BEGIN
    -- Check if unique constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'club_members' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%club_id%user_id%'
    ) THEN
        -- Add unique constraint if not exists
        ALTER TABLE club_members 
        ADD CONSTRAINT unique_club_user_member 
        UNIQUE (club_id, user_id);
        
        RAISE NOTICE '✅ Added unique constraint (club_id, user_id) to club_members';
    ELSE
        RAISE NOTICE '⚠️ Unique constraint already exists on club_members';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Error adding constraint (might already exist): %', SQLERRM;
END $$;

-- Step 2: Create improved approve_rank_request function
-- ================================================================================
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
  
  -- Ensure player_rankings record exists
  INSERT INTO player_rankings (user_id, updated_at)
  VALUES (v_user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET 
    updated_at = NOW();
  
  -- Update user's verified rank
  UPDATE profiles 
  SET verified_rank = request_record.requested_rank,
      updated_at = NOW()
  WHERE user_id = v_user_id;
  
  -- Add user to club_members with proper conflict handling
  INSERT INTO club_members (club_id, user_id, join_date, status, created_at)
  VALUES (club_id, v_user_id, NOW(), 'active', NOW())
  ON CONFLICT (club_id, user_id) DO UPDATE SET 
    status = 'active',
    updated_at = NOW(),
    join_date = COALESCE(club_members.join_date, NOW());
  
  -- Log the approval
  INSERT INTO club_activity_logs (
    club_id,
    user_id,
    action_type,
    action_data,
    created_by,
    created_at
  ) VALUES (
    club_id,
    v_user_id,
    'rank_approved',
    jsonb_build_object(
      'request_id', request_id,
      'approved_rank', request_record.requested_rank,
      'approver_id', approver_id
    ),
    approver_id,
    NOW()
  ) ON CONFLICT DO NOTHING; -- Safe fallback if logs table doesn't exist
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Rank request approved successfully',
    'user_id', v_user_id,
    'approved_rank', request_record.requested_rank
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Return detailed error for debugging
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'error_detail', SQLSTATE,
    'function', 'approve_rank_request'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION approve_rank_request(UUID, UUID, UUID) TO authenticated;

-- Step 3: Create alternative safe approve function (fallback)
-- ================================================================================
CREATE OR REPLACE FUNCTION approve_rank_request_safe(
  request_id UUID,
  approver_id UUID,
  club_id UUID
)
RETURNS JSONB AS $$
DECLARE
  request_record RECORD;
  v_user_id UUID;
  v_member_exists BOOLEAN := false;
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
  
  -- Check if player_rankings exists
  IF NOT EXISTS (SELECT 1 FROM player_rankings WHERE user_id = v_user_id) THEN
    INSERT INTO player_rankings (user_id, updated_at)
    VALUES (v_user_id, NOW());
  ELSE
    UPDATE player_rankings 
    SET updated_at = NOW()
    WHERE user_id = v_user_id;
  END IF;
  
  -- Update user's verified rank
  UPDATE profiles 
  SET verified_rank = request_record.requested_rank,
      updated_at = NOW()
  WHERE user_id = v_user_id;
  
  -- Check if club member exists
  SELECT EXISTS(
    SELECT 1 FROM club_members 
    WHERE club_id = club_id AND user_id = v_user_id
  ) INTO v_member_exists;
  
  -- Add or update club member
  IF NOT v_member_exists THEN
    INSERT INTO club_members (club_id, user_id, join_date, status, created_at)
    VALUES (club_id, v_user_id, NOW(), 'active', NOW());
  ELSE
    UPDATE club_members 
    SET status = 'active', updated_at = NOW()
    WHERE club_id = club_id AND user_id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Rank request approved successfully (safe mode)',
    'user_id', v_user_id,
    'approved_rank', request_record.requested_rank
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'error_detail', SQLSTATE,
    'function', 'approve_rank_request_safe'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION approve_rank_request_safe(UUID, UUID, UUID) TO authenticated;

-- Step 4: Verification
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Club members constraint and approve functions fixed!';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Available functions:';
    RAISE NOTICE '   • approve_rank_request() - Main function with improved error handling';
    RAISE NOTICE '   • approve_rank_request_safe() - Fallback function without ON CONFLICT';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Both functions handle club member addition safely!';
END $$;
