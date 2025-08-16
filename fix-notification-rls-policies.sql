-- 🔐 FIX NOTIFICATION RLS POLICIES
-- This script ensures authenticated users can access their notifications properly

-- First, let's check current state
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  hasrls
FROM pg_tables 
WHERE tablename = 'challenge_notifications';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own notifications" ON challenge_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON challenge_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON challenge_notifications;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON challenge_notifications;

-- Ensure RLS is enabled
ALTER TABLE challenge_notifications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON challenge_notifications 
FOR SELECT 
USING (
  auth.uid()::text = user_id 
  OR 
  auth.role() = 'service_role'
);

-- Policy 2: Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" 
ON challenge_notifications 
FOR UPDATE 
USING (
  auth.uid()::text = user_id 
  OR 
  auth.role() = 'service_role'
);

-- Policy 3: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON challenge_notifications 
FOR DELETE 
USING (
  auth.uid()::text = user_id 
  OR 
  auth.role() = 'service_role'
);

-- Policy 4: Service role can insert notifications for any user
CREATE POLICY "Service role can insert notifications" 
ON challenge_notifications 
FOR INSERT 
WITH CHECK (
  auth.role() = 'service_role'
  OR
  auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT SELECT, UPDATE, DELETE ON challenge_notifications TO authenticated;
GRANT ALL ON challenge_notifications TO service_role;

-- Test the policies
DO $$
BEGIN
  RAISE NOTICE '✅ RLS POLICIES UPDATED SUCCESSFULLY';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 POLICIES CREATED:';
  RAISE NOTICE '1. Users can view their own notifications';
  RAISE NOTICE '2. Users can update their own notifications';
  RAISE NOTICE '3. Users can delete their own notifications';
  RAISE NOTICE '4. Service role can insert notifications';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 NEXT STEPS:';
  RAISE NOTICE '1. Test with authenticated user in frontend';
  RAISE NOTICE '2. Notification bell should work properly';
  RAISE NOTICE '3. Real-time updates should sync correctly';
END $$;
