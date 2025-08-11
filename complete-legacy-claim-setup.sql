-- COMPLETE LEGACY CLAIM SETUP SQL
-- Copy và paste toàn bộ SQL này vào Supabase SQL Editor để setup hệ thống claim

-- 1. Thêm claim_code column nếu chưa có
ALTER TABLE legacy_spa_points 
ADD COLUMN IF NOT EXISTS claim_code TEXT;

-- 2. Tạo index cho claim_code
CREATE INDEX IF NOT EXISTS idx_legacy_spa_points_claim_code 
ON legacy_spa_points(claim_code);

-- 3. Update record ANH LONG MAGIC với claim code
UPDATE legacy_spa_points 
SET claim_code = 'LEGACY-46-ANH'
WHERE full_name = 'ANH LONG MAGIC' 
  AND claim_code IS NULL;

-- 4. Drop function cũ nếu có
DROP FUNCTION IF EXISTS claim_legacy_spa_points CASCADE;

-- 5. Tạo function mới
CREATE OR REPLACE FUNCTION claim_legacy_spa_points(
  p_claim_code TEXT,
  p_user_id UUID,  
  p_user_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_legacy_entry legacy_spa_points%ROWTYPE;
  v_current_spa_points INTEGER := 0;
  v_new_spa_points INTEGER;
  v_result JSON;
BEGIN
  -- Find the legacy entry by claim code
  SELECT * INTO v_legacy_entry
  FROM legacy_spa_points
  WHERE claim_code = p_claim_code;
  
  -- Check if claim code exists
  IF v_legacy_entry.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Mã claim không tồn tại hoặc không hợp lệ'
    );
  END IF;
  
  -- Check if already claimed
  IF v_legacy_entry.claimed_at IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Mã này đã được claim lúc ' || to_char(v_legacy_entry.claimed_at, 'DD/MM/YYYY HH24:MI')
    );
  END IF;
  
  -- Check if user already claimed this specific entry  
  IF v_legacy_entry.claimed_by = p_user_id THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Bạn đã claim mã này rồi'
    );
  END IF;
  
  -- Get current SPA points of the user
  SELECT COALESCE(spa_points, 0) INTO v_current_spa_points
  FROM player_rankings
  WHERE player_id = p_user_id;
  
  -- Calculate new SPA points
  v_new_spa_points := v_current_spa_points + v_legacy_entry.spa_points;
  
  -- Start transaction
  BEGIN
    -- Update legacy entry as claimed
    UPDATE legacy_spa_points
    SET 
      claimed_at = NOW(),
      claimed_by = p_user_id,
      claimed = true,
      updated_at = NOW()
    WHERE claim_code = p_claim_code
      AND claimed_at IS NULL; -- Ensure it's still unclaimed
    
    -- Check if the update affected any rows (double-check for race conditions)
    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Mã này đã được claim bởi người khác'
      );
    END IF;
    
    -- Update user's SPA points
    IF EXISTS (SELECT 1 FROM player_rankings WHERE player_id = p_user_id) THEN
      -- Update existing record
      UPDATE player_rankings
      SET 
        spa_points = v_new_spa_points,
        updated_at = NOW()
      WHERE player_id = p_user_id;
    ELSE
      -- Insert new record
      INSERT INTO player_rankings (
        player_id,
        spa_points,
        created_at,
        updated_at
      ) VALUES (
        p_user_id,
        v_new_spa_points,
        NOW(),
        NOW()
      );
    END IF;
    
    -- Log the transaction (optional - comment out if admin_actions table doesn't exist)
    /*
    INSERT INTO admin_actions (
      admin_id,
      action_type,
      target_type,
      target_id,
      details
    ) VALUES (
      p_user_id,
      'legacy_spa_claim',
      'legacy_spa_points',
      v_legacy_entry.id::text,
      json_build_object(
        'claim_code', p_claim_code,
        'spa_points', v_legacy_entry.spa_points,
        'previous_spa_points', v_current_spa_points,
        'new_spa_points', v_new_spa_points,
        'legacy_player_name', v_legacy_entry.full_name
      )
    );
    */
    
    -- Return success
    RETURN json_build_object(
      'success', true,
      'message', 'Claim thành công!',
      'spa_points', v_legacy_entry.spa_points,
      'previous_spa_points', v_current_spa_points,
      'new_spa_points', v_new_spa_points
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error and return failure
      RAISE LOG 'Error in claim_legacy_spa_points: %', SQLERRM;
      RETURN json_build_object(
        'success', false,
        'message', 'Có lỗi xảy ra trong quá trình xử lý: ' || SQLERRM
      );
  END;
END;
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION claim_legacy_spa_points(TEXT, UUID, TEXT) TO authenticated;

-- 7. Add comment
COMMENT ON FUNCTION claim_legacy_spa_points IS 'Claims legacy SPA points using claim code and updates user profile';

-- 8. Verify setup (optional - để kiểm tra)
SELECT 
  id,
  full_name,
  spa_points,
  claim_code,
  claimed,
  claimed_at,
  claimed_by
FROM legacy_spa_points 
WHERE claim_code IS NOT NULL;
