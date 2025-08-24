-- TEST: Tạo 1 function đơn giản để test connection
-- Nếu function này tạo được thì rebuild sẽ work

DROP FUNCTION IF EXISTS test_rebuild_connection();

CREATE OR REPLACE FUNCTION test_rebuild_connection()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'status', 'success',
        'message', 'Rebuild connection working!',
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test call
SELECT test_rebuild_connection();
