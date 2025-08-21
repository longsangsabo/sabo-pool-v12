-- ===============================================
-- CLEAN UP DUPLICATE RLS POLICIES FOR CHALLENGES TABLE
-- Removes all existing policies and creates clean, consistent ones
-- Run this in Supabase SQL Editor
-- ===============================================

-- 1. Drop ALL existing policies (both old and new names)
DROP POLICY IF EXISTS "Users can accept open challenges" ON challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update challenges they're involved in" ON challenges;
DROP POLICY IF EXISTS "Users can view challenges they're involved in or open challenge" ON challenges;
DROP POLICY IF EXISTS "Users can insert their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view all challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update their challenges" ON challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON challenges;
DROP POLICY IF EXISTS "challenges_insert_policy" ON challenges;
DROP POLICY IF EXISTS "challenges_select_policy" ON challenges;
DROP POLICY IF EXISTS "challenges_update_policy" ON challenges;
DROP POLICY IF EXISTS "challenges_delete_policy" ON challenges;
DROP POLICY IF EXISTS "challenges_insert_authenticated" ON challenges;
DROP POLICY IF EXISTS "challenges_select_authenticated" ON challenges;
DROP POLICY IF EXISTS "challenges_update_authenticated" ON challenges;
DROP POLICY IF EXISTS "challenges_delete_authenticated" ON challenges;

-- 2. Create clean, comprehensive RLS policies
CREATE POLICY "challenges_policy_insert" ON challenges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "challenges_policy_select" ON challenges
  FOR SELECT TO authenticated
  USING (true); -- Allow viewing all challenges for browse/accept features

CREATE POLICY "challenges_policy_update" ON challenges
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = challenger_id OR 
    auth.uid() = opponent_id OR
    (status = 'open' AND opponent_id IS NULL) -- Allow accepting open challenges
  )
  WITH CHECK (
    auth.uid() = challenger_id OR 
    auth.uid() = opponent_id OR
    (status = 'open' AND opponent_id IS NULL)
  );

CREATE POLICY "challenges_policy_delete" ON challenges
  FOR DELETE TO authenticated
  USING (auth.uid() = challenger_id);

-- 3. Ensure RLS is enabled
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- 4. Verify only our 4 policies exist
SELECT 
  policyname, 
  cmd as operation,
  permissive,
  CASE WHEN qual IS NOT NULL THEN 'Has USING clause' ELSE 'No USING clause' END as using_clause,
  CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause' ELSE 'No WITH CHECK clause' END as with_check_clause
FROM pg_policies 
WHERE tablename = 'challenges'
ORDER BY policyname;

-- Expected result: Only 4 policies with names:
-- - challenges_policy_delete
-- - challenges_policy_insert  
-- - challenges_policy_select
-- - challenges_policy_update

-- ===============================================
-- RLS POLICIES CLEANUP COMPLETED
-- Should now have exactly 4 clean policies
-- ===============================================
