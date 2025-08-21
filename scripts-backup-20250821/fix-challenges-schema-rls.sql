-- Fix challenges table schema and RLS policies
-- Run this SQL in Supabase SQL Editor

-- 1. Add missing columns
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS required_rank TEXT,
ADD COLUMN IF NOT EXISTS challenger_name TEXT;

-- 2. Add comments
COMMENT ON COLUMN challenges.location IS 'Club location/name for the challenge';
COMMENT ON COLUMN challenges.required_rank IS 'Minimum rank requirement (G, H, I, K, etc.)';
COMMENT ON COLUMN challenges.challenger_name IS 'Cached challenger name for display';

-- 3. Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'challenges';

-- 4. Temporarily disable RLS for testing (if needed)
-- ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;

-- 5. Or create proper RLS policies for authenticated users
DROP POLICY IF EXISTS "Users can insert their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON challenges;

-- Create comprehensive RLS policies
CREATE POLICY "Users can insert their own challenges" ON challenges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can view challenges" ON challenges
  FOR SELECT TO authenticated
  USING (true); -- Anyone can view challenges

CREATE POLICY "Users can update their own challenges" ON challenges
  FOR UPDATE TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id)
  WITH CHECK (auth.uid() = challenger_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can delete their own challenges" ON challenges
  FOR DELETE TO authenticated
  USING (auth.uid() = challenger_id);

-- 6. Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- 7. Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'challenges' 
AND column_name IN ('location', 'required_rank', 'challenger_name');

-- 8. Test policies
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'challenges';
