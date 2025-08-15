-- Add organizer_id column to tournaments table and fix RLS policies
-- This script adds the missing organizer_id column and updates RLS policies

-- Step 1: Add organizer_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'organizer_id'
  ) THEN
    -- Add organizer_id column with reference to auth.users
    ALTER TABLE tournaments ADD COLUMN organizer_id UUID REFERENCES auth.users(id);
    
    -- Initialize organizer_id with created_by for existing records
    UPDATE tournaments SET organizer_id = created_by WHERE created_by IS NOT NULL;
    
    COMMENT ON COLUMN tournaments.organizer_id IS 'User ID of the tournament organizer';
    RAISE NOTICE 'Added organizer_id column and initialized with created_by values';
  ELSE
    RAISE NOTICE 'organizer_id column already exists';
  END IF;
END
$$;

-- Step 2: Verify if RLS is enabled for the tournaments table
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

-- Step 3: Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Tournaments are viewable by everyone" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Tournament organizers can update their tournaments" ON tournaments;
DROP POLICY IF EXISTS "Tournament organizers can delete their tournaments" ON tournaments;
DROP POLICY IF EXISTS "public_view_visible_tournaments" ON tournaments;

-- Step 4: Create proper RLS policies

-- Policy for viewing tournaments: Everyone can see public tournaments
CREATE POLICY "Tournaments are viewable by everyone" 
ON tournaments FOR SELECT 
USING (is_public = true OR auth.uid() = created_by OR auth.uid() = organizer_id);

-- Add back the public view policy for backward compatibility
CREATE POLICY "public_view_visible_tournaments" 
ON tournaments FOR SELECT
TO public 
USING (is_visible = true AND deleted_at IS NULL);

-- Policy for creating tournaments: Any authenticated user can create tournaments
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

-- Step 5: Verify the policies after creation
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
