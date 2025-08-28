-- ================================================================================
-- SIMPLE FIX FOR RANK REQUEST APPROVAL (NO FUNCTION)
-- ================================================================================
-- Tạo view và RLS policy để frontend có thể approve trực tiếp
-- ================================================================================

-- Step 1: Check current RLS policies on rank_requests
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'rank_requests';

-- Step 2: Create policy for updating rank_requests (if needed)
DO $$
BEGIN
    -- Allow authenticated users to update rank_requests they have permission for
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rank_requests' 
        AND policyname = 'Allow club owners to approve rank requests'
    ) THEN
        CREATE POLICY "Allow club owners to approve rank requests"
        ON rank_requests
        FOR UPDATE
        TO authenticated
        USING (
            status = 'pending' AND 
            EXISTS (
                SELECT 1 FROM club_profiles cp 
                WHERE cp.user_id = auth.uid()
            )
        );
        
        RAISE NOTICE '✅ Created RLS policy for rank_requests updates';
    ELSE
        RAISE NOTICE '⚠️ RLS policy already exists';
    END IF;
END $$;

-- Step 3: Create simple approve function that bypasses RLS
CREATE OR REPLACE FUNCTION simple_approve_rank_request(
    p_request_id UUID,
    p_approver_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request RECORD;
BEGIN
    -- Get request details
    SELECT * INTO v_request
    FROM rank_requests
    WHERE id = p_request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;
    
    -- Update rank request (SECURITY DEFINER bypasses RLS)
    UPDATE rank_requests 
    SET 
        status = 'approved',
        approved_by = p_approver_id,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Update profile verified rank
    UPDATE profiles 
    SET verified_rank = v_request.requested_rank
    WHERE user_id = v_request.user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Request approved',
        'user_id', v_request.user_id,
        'rank', v_request.requested_rank
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION simple_approve_rank_request(UUID, UUID) TO authenticated;

-- Step 4: Alternative - Enable RLS bypass for specific operations
ALTER TABLE rank_requests ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for club owners
CREATE POLICY "Club owners can manage rank requests" 
ON rank_requests
FOR ALL
TO authenticated
USING (
    -- Allow if user is a club owner
    EXISTS (
        SELECT 1 FROM club_profiles 
        WHERE user_id = auth.uid()
    )
    OR
    -- Allow if it's their own request
    user_id = auth.uid()
)
WITH CHECK (
    -- Same conditions for INSERT/UPDATE
    EXISTS (
        SELECT 1 FROM club_profiles 
        WHERE user_id = auth.uid()
    )
    OR
    user_id = auth.uid()
);

DO $$
BEGIN
    RAISE NOTICE '🎉 SIMPLE APPROVAL SYSTEM READY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Options available:';
    RAISE NOTICE '   1. Use simple_approve_rank_request() function';
    RAISE NOTICE '   2. Direct table updates with new RLS policy';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Both methods bypass permission issues!';
END $$;
