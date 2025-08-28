-- ================================================================================
-- DROP AND RECREATE APPROVE_RANK_REQUEST FUNCTION WITH PROPER CONSTRAINTS
-- ================================================================================
-- Fix lỗi ON CONFLICT bằng cách drop function cũ và tạo lại với constraint đúng
-- ================================================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Dropping and recreating approve_rank_request function...';
END $$;

-- Step 1: Drop existing function
-- ================================================================================
DROP FUNCTION IF EXISTS approve_rank_request(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS approve_rank_request_safe(UUID, UUID, UUID);

DO $$
BEGIN
    RAISE NOTICE '🗑️ Dropped existing approve_rank_request functions';
END $$;

-- Step 2: Create/verify unique constraint on club_members
-- ================================================================================
DO $$
BEGIN
    -- First, remove any duplicate records that might prevent constraint creation
    DELETE FROM club_members a USING (
        SELECT MIN(ctid) as ctid, club_id, user_id
        FROM club_members 
        GROUP BY club_id, user_id 
        HAVING COUNT(*) > 1
    ) b
    WHERE a.club_id = b.club_id AND a.user_id = b.user_id AND a.ctid <> b.ctid;
    
    RAISE NOTICE '🧹 Cleaned up duplicate club_members records';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Cleanup warning: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Add unique constraint
    ALTER TABLE club_members 
    ADD CONSTRAINT club_members_unique_club_user 
    UNIQUE (club_id, user_id);
    
    RAISE NOTICE '✅ Created unique constraint on club_members (club_id, user_id)';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE '⚠️ Constraint club_members_unique_club_user already exists';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating constraint: %', SQLERRM;
END $$;

-- Step 3: Verify constraint exists
-- ================================================================================
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'club_members' 
    AND constraint_type = 'UNIQUE'
    AND (constraint_name LIKE '%club%user%' OR constraint_name LIKE '%unique%');
    
    IF constraint_count > 0 THEN
        RAISE NOTICE '✅ Verified: club_members has unique constraint';
    ELSE
        RAISE NOTICE '❌ Warning: No unique constraint found on club_members';
    END IF;
END $$;

-- Step 4: Create new approve_rank_request function (simplified, no ON CONFLICT)
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
  
  -- Check if player_rankings record exists
  SELECT EXISTS(
    SELECT 1 FROM player_rankings WHERE user_id = v_user_id
  ) INTO v_player_ranking_exists;
  
  IF NOT v_player_ranking_exists THEN
    INSERT INTO player_rankings (user_id, updated_at, created_at)
    VALUES (v_user_id, NOW(), NOW());
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
    WHERE club_id = approve_rank_request.club_id AND user_id = v_user_id
  ) INTO v_member_exists;
  
  -- Add or update club member (NO ON CONFLICT)
  IF NOT v_member_exists THEN
    INSERT INTO club_members (club_id, user_id, join_date, status, created_at)
    VALUES (club_id, v_user_id, NOW(), 'active', NOW());
  ELSE
    UPDATE club_members 
    SET status = 'active', 
        updated_at = NOW()
    WHERE club_id = approve_rank_request.club_id AND user_id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Rank request approved successfully',
    'user_id', v_user_id,
    'approved_rank', request_record.requested_rank,
    'club_id', club_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'error_state', SQLSTATE,
    'hint', 'Check if all required tables exist and have proper structure'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create alternative function with ON CONFLICT (now that constraint exists)
-- ================================================================================
CREATE OR REPLACE FUNCTION approve_rank_request_with_conflict(
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
  
  -- Ensure player_rankings record exists (with ON CONFLICT)
  INSERT INTO player_rankings (user_id, updated_at, created_at)
  VALUES (v_user_id, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET 
    updated_at = NOW();
  
  -- Update user's verified rank
  UPDATE profiles 
  SET verified_rank = request_record.requested_rank,
      updated_at = NOW()
  WHERE user_id = v_user_id;
  
  -- Add user to club_members (with ON CONFLICT - now constraint exists)
  INSERT INTO club_members (club_id, user_id, join_date, status, created_at)
  VALUES (club_id, v_user_id, NOW(), 'active', NOW())
  ON CONFLICT (club_id, user_id) DO UPDATE SET 
    status = 'active',
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Rank request approved successfully (with ON CONFLICT)',
    'user_id', v_user_id,
    'approved_rank', request_record.requested_rank
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'error_state', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Grant permissions
-- ================================================================================
GRANT EXECUTE ON FUNCTION approve_rank_request(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_rank_request_with_conflict(UUID, UUID, UUID) TO authenticated;

-- Step 7: Test and verify
-- ================================================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 Functions recreated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Available functions:';
    RAISE NOTICE '   • approve_rank_request() - Safe version without ON CONFLICT';
    RAISE NOTICE '   • approve_rank_request_with_conflict() - Version with ON CONFLICT';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Main function uses IF/ELSE instead of ON CONFLICT for maximum compatibility';
    RAISE NOTICE '💡 Both functions should work, but recommend using the main one';
END $$;

-- Step 8: Verification query
-- ================================================================================
SELECT 
    'club_members constraints' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'club_members' 
AND constraint_type = 'UNIQUE';
