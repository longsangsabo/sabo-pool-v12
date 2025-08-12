-- Fix Row-Level Security policies for tournaments table
-- This script adjusts RLS policies to allow authenticated users to create tournaments

-- First, verify if RLS is enabled for the tournaments table
DO $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'tournaments' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  IF rls_enabled THEN
    RAISE NOTICE 'RLS is enabled for tournaments table';
  ELSE
    RAISE NOTICE 'RLS is not enabled for tournaments table, enabling it now';
    ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Tournaments are viewable by everyone" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Tournament organizers can update their tournaments" ON tournaments;
DROP POLICY IF EXISTS "Tournament organizers can delete their tournaments" ON tournaments;

-- Create proper RLS policies

-- Policy for viewing tournaments: Everyone can see all tournaments
CREATE POLICY "Tournaments are viewable by everyone" 
ON tournaments FOR SELECT 
USING (true);

-- Policy for creating tournaments: Any authenticated user can create tournaments
-- This is the most important policy for fixing your current error
CREATE POLICY "Authenticated users can create tournaments" 
ON tournaments FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy for updating tournaments: Only tournament organizers or creators can update
CREATE POLICY "Tournament organizers can update their tournaments" 
ON tournaments FOR UPDATE 
TO authenticated
USING (auth.uid() = organizer_id OR auth.uid() = created_by);

-- Policy for deleting tournaments: Only tournament organizers or creators can delete
CREATE POLICY "Tournament organizers can delete their tournaments" 
ON tournaments FOR DELETE 
TO authenticated
USING (auth.uid() = organizer_id OR auth.uid() = created_by);

-- Verify the policies after creation
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
WHERE tablename = 'tournaments'
ORDER BY policyname;
