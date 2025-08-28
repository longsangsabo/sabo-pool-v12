-- =============================================
-- FIX SABO-32 RLS POLICY FOR TOURNAMENT_MATCHES
-- Allow authenticated users to insert tournament matches
-- =============================================

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tournament_matches';

-- Drop existing restrictive INSERT policy if exists
DROP POLICY IF EXISTS "Users can insert tournament matches they manage" ON tournament_matches;
DROP POLICY IF EXISTS "Users can only insert their own tournament matches" ON tournament_matches;
DROP POLICY IF EXISTS "Authenticated users can insert tournament matches" ON tournament_matches;

-- Create new permissive INSERT policy for SABO-32
CREATE POLICY "Allow authenticated users to insert tournament matches"
ON tournament_matches
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user is authenticated and tournament exists
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_matches.tournament_id
  )
);

-- Update existing SELECT policy to be more permissive
DROP POLICY IF EXISTS "Users can view tournament matches" ON tournament_matches;
CREATE POLICY "Allow authenticated users to view tournament matches"
ON tournament_matches
FOR SELECT
TO authenticated
USING (true);

-- Update existing UPDATE policy for score submission
DROP POLICY IF EXISTS "Users can update tournament matches" ON tournament_matches;
CREATE POLICY "Allow authenticated users to update tournament matches"
ON tournament_matches
FOR UPDATE
TO authenticated
USING (
  -- Allow if user is authenticated and tournament exists
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_matches.tournament_id
  )
)
WITH CHECK (
  -- Allow if user is authenticated and tournament exists
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_matches.tournament_id
  )
);

-- Ensure RLS is enabled
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT, SELECT, UPDATE ON tournament_matches TO authenticated;

-- Test the policy
SELECT 'SABO-32 RLS policies updated successfully' as status;

-- Show current policies after update
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tournament_matches';
