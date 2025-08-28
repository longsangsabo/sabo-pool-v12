-- Fix RLS policies for notifications table
-- This should be run on Supabase to ensure authenticated users can see their notifications

-- First, let's check current policies
DO $$
BEGIN
    RAISE NOTICE 'Current notifications table policies:';
END $$;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can do everything" ON notifications;

-- Create proper RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to manage all notifications
CREATE POLICY "Service role can do everything" ON notifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Test the policies
DO $$
BEGIN
    RAISE NOTICE 'RLS policies for notifications table have been updated.';
    RAISE NOTICE 'Policies created:';
    RAISE NOTICE '1. Users can view their own notifications (SELECT)';
    RAISE NOTICE '2. Users can update their own notifications (UPDATE)';  
    RAISE NOTICE '3. Service role can do everything (ALL)';
END $$;

-- Also ensure spa_transactions has proper policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'spa_transactions';

-- Update spa_transactions policies if needed
DROP POLICY IF EXISTS "Users can view their own spa transactions" ON spa_transactions;
DROP POLICY IF EXISTS "Service role can manage spa transactions" ON spa_transactions;

CREATE POLICY "Users can view their own spa transactions" ON spa_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage spa transactions" ON spa_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

ALTER TABLE spa_transactions ENABLE ROW LEVEL SECURITY;

-- Final verification
DO $$
BEGIN
    RAISE NOTICE 'All RLS policies have been updated for notifications and spa_transactions tables.';
    RAISE NOTICE 'Please test the mobile notification bell with an authenticated user.';
END $$;
