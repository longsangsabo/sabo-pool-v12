-- FIX SPA TRANSACTIONS RLS POLICIES
-- Allow authenticated users to see their own SPA transactions

-- Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'spa_transactions';

-- Enable RLS if not already enabled
ALTER TABLE spa_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to recreate properly)
DROP POLICY IF EXISTS "Users can view their own SPA transactions" ON spa_transactions;

-- Create proper RLS policy: authenticated users can see their own transactions
CREATE POLICY "Users can view their own SPA transactions" 
ON spa_transactions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow service role to see all (for admin purposes)
DROP POLICY IF EXISTS "Service role can manage all SPA transactions" ON spa_transactions;
CREATE POLICY "Service role can manage all SPA transactions" 
ON spa_transactions FOR ALL 
TO service_role 
USING (true);

-- Verify policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'spa_transactions';

-- Test query as authenticated user (replace user_id with actual user ID for testing)
-- This should work when executed as authenticated user:
-- SELECT * FROM spa_transactions WHERE user_id = auth.uid();
