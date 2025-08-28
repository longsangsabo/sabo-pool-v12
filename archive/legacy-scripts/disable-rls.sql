-- Disable RLS to fix data access issues
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on challenges table
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on profiles table  
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on club_profiles table
ALTER TABLE club_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view all challenges" ON challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update their challenges" ON challenges;
DROP POLICY IF EXISTS "Club owners can confirm challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view club profiles" ON club_profiles;
DROP POLICY IF EXISTS "Users can update own club profiles" ON club_profiles;

-- 5. Verify RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('challenges', 'profiles', 'club_profiles');

SELECT 'RLS disabled for all tables' as status;
