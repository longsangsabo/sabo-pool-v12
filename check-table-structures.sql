-- Check challenges table structure to identify potential column conflicts
-- Run this to see what columns already exist

-- 1. Check all columns in challenges table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'challenges'
ORDER BY ordinal_position;

-- 2. Check for specific columns that might conflict
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'challenger_name') 
    THEN 'challenger_name EXISTS - CONFLICT!'
    ELSE 'challenger_name OK'
  END as challenger_name_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'opponent_name') 
    THEN 'opponent_name EXISTS - CONFLICT!'
    ELSE 'opponent_name OK'
  END as opponent_name_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'club_name') 
    THEN 'club_name EXISTS - CONFLICT!'
    ELSE 'club_name OK'
  END as club_name_status;

-- 3. Check profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check club_profiles table structure  
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'club_profiles'
ORDER BY ordinal_position;
