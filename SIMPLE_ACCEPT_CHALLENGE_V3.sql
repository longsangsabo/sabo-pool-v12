-- FUNCTION CHỈ SỬ DỤNG COLUMNS TỒN TẠI THỰC TẾ
-- ==============================================

DROP FUNCTION IF EXISTS accept_open_challenge_v3(uuid, uuid);

CREATE OR REPLACE FUNCTION accept_open_challenge_v3(
    p_challenge_id uuid,
    p_user_id uuid
)
RETURNS JSON AS $$
DECLARE
    challenge_data RECORD;
    challenger_spa integer;
    opponent_spa integer;
    required_spa integer;
BEGIN
    -- 1. Lấy thông tin challenge - CHỈ COLUMNS TỒN TẠI
    SELECT 
        id, 
        challenger_id, 
        opponent_id, 
        status, 
        bet_points,  -- ✅ TỒN TẠI
        club_id
    INTO challenge_data
    FROM challenges 
    WHERE id = p_challenge_id;

    -- Kiểm tra challenge tồn tại
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Challenge not found');
    END IF;

    -- Kiểm tra status - DÙNG ĐÚNG VALUES
    IF challenge_data.status NOT IN ('open', 'pending') THEN
        RETURN json_build_object('success', false, 'error', 'Challenge not available');
    END IF;

    -- Kiểm tra không phải challenge của mình
    IF challenge_data.challenger_id = p_user_id THEN
        RETURN json_build_object('success', false, 'error', 'Cannot accept own challenge');
    END IF;

    -- Kiểm tra chưa có opponent
    IF challenge_data.opponent_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'Challenge already taken');
    END IF;

    required_spa := challenge_data.bet_points;  -- ✅ COLUMN TỒN TẠI

    -- 2. Kiểm tra SPA - CHỈ COLUMNS TỒN TẠI
    SELECT spa_points INTO challenger_spa  -- ✅ TỒN TẠI 
    FROM profiles 
    WHERE user_id = challenge_data.challenger_id;  -- ✅ TỒN TẠI

    SELECT spa_points INTO opponent_spa  -- ✅ TỒN TẠI
    FROM profiles 
    WHERE user_id = p_user_id;  -- ✅ TỒN TẠI

    IF challenger_spa < required_spa THEN
        RETURN json_build_object('success', false, 'error', 'Challenger insufficient SPA');
    END IF;

    IF opponent_spa < required_spa THEN
        RETURN json_build_object('success', false, 'error', 'You have insufficient SPA');
    END IF;

    -- 3. Thực hiện transaction - CHỈ COLUMNS TỒN TẠI
    BEGIN
        -- Trừ SPA
        UPDATE profiles 
        SET spa_points = spa_points - required_spa  -- ✅ TỒN TẠI
        WHERE user_id = challenge_data.challenger_id;  -- ✅ TỒN TẠI
        
        UPDATE profiles 
        SET spa_points = spa_points - required_spa  -- ✅ TỒN TẠI
        WHERE user_id = p_user_id;  -- ✅ TỒN TẠI
        
        -- Update challenge - CHỈ COLUMNS TỒN TẠI
        UPDATE challenges 
        SET opponent_id = p_user_id,  -- ✅ TỒN TẠI
            status = 'accepted',  -- ✅ TỒN TẠI
            responded_at = NOW()  -- ✅ TỒN TẠI
        WHERE id = p_challenge_id;

        -- Return success - KHÔNG REFERENCE FIELDS KHÔNG TỒN TẠI
        RETURN json_build_object(
            'success', true,
            'message', 'Challenge accepted successfully',
            'challenge_id', p_challenge_id,
            'challenger_id', challenge_data.challenger_id,
            'opponent_id', p_user_id,
            'spa_amount', required_spa,
            'status', 'accepted'
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
    END;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'CORRECT accept_open_challenge_v3 created!' as result;
