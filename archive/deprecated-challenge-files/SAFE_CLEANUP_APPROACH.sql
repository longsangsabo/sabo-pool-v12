-- PHƯƠNG PHÁP CLEANUP AN TOÀN - TỪNG BƯỚC
-- =====================================================

-- BƯỚC 1: DROP CÁC FUNCTIONS CORE BỊ LỖI (chắc chắn cần thay thế)
-- Những functions này gây ra lỗi hiện tại
DROP FUNCTION IF EXISTS accept_open_challenge(bigint, uuid);
DROP FUNCTION IF EXISTS accept_challenge_emergency_workaround(bigint, uuid);
DROP FUNCTION IF EXISTS accept_open_challenge_fixed(bigint, uuid);
DROP FUNCTION IF EXISTS accept_open_challenge_simple(bigint, uuid);

-- BƯỚC 2: DROP FUNCTIONS TRÙNG LẶP VÀ DEPRECATED
DROP FUNCTION IF EXISTS accept_challenge(bigint, uuid);
DROP FUNCTION IF EXISTS complete_challenge(bigint, uuid, text);
DROP FUNCTION IF EXISTS complete_challenge_match(bigint, uuid, text);
DROP FUNCTION IF EXISTS create_challenge(uuid, uuid, integer, text, text);

-- BƯỚC 3: BACKUP CÁC FUNCTIONS QUAN TRỌNG TRƯỚC KHI DROP
-- Tạo backup functions để có thể restore nếu cần
CREATE OR REPLACE FUNCTION backup_get_challenge_config()
RETURNS JSON AS $$
DECLARE
    original_function_exists boolean;
BEGIN
    -- Check if original function exists
    SELECT EXISTS(
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_challenge_config'
    ) INTO original_function_exists;
    
    IF original_function_exists THEN
        -- Call original function if exists
        RETURN (SELECT get_challenge_config());
    ELSE
        -- Return default config
        RETURN json_build_object(
            'status', 'backup',
            'message', 'Original function not found',
            'timestamp', NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- BƯỚC 4: KIỂM TRA CÁC TRIGGERS TRƯỚC KHI DROP
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%challenge%'
ORDER BY trigger_name;

-- BƯỚC 5: LIST FUNCTIONS SAU KHI CLEANUP
SELECT proname, prosrc IS NOT NULL as has_body
FROM pg_proc 
WHERE proname LIKE '%challenge%' 
ORDER BY proname;
