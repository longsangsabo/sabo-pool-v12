-- Fix deadlock - run each command separately
-- Copy and run ONE AT A TIME in Supabase SQL Editor

-- Step 1: Drop policies first
DROP POLICY IF EXISTS "Users can view all challenges" ON challenges;

-- Step 2: 
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;

-- Step 3:
DROP POLICY IF EXISTS "Users can update their challenges" ON challenges;

-- Step 4:
DROP POLICY IF EXISTS "Club owners can confirm challenges" ON challenges;

-- Step 5:
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Step 6:
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Step 7:
DROP POLICY IF EXISTS "Users can view club profiles" ON club_profiles;

-- Step 8:
DROP POLICY IF EXISTS "Users can update own club profiles" ON club_profiles;

-- Step 9: Disable RLS on challenges
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;

-- Step 10: Disable RLS on profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 11: Disable RLS on club_profiles
ALTER TABLE club_profiles DISABLE ROW LEVEL SECURITY;

-- Step 12: Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('challenges', 'profiles', 'club_profiles');
