-- COMPLETE MIGRATION GUIDE
-- Run these scripts in order in Supabase SQL Editor

-- ===========================================
-- SCRIPT 1: Fix club_profiles table first
-- ===========================================
-- Copy and run fix-club-profiles.sql content first

-- ===========================================  
-- SCRIPT 2: Main club confirmation migration
-- ===========================================
-- Copy and run add-club-confirmation.sql content after

-- ===========================================
-- SCRIPT 3: Verification queries
-- ===========================================

-- Check club_profiles structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns
WHERE table_name = 'club_profiles'
ORDER BY ordinal_position;

-- Check challenges structure  
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns
WHERE table_name = 'challenges'
AND column_name LIKE '%club%'
ORDER BY ordinal_position;

-- Check status distribution
SELECT 
  status, 
  COUNT(*) as count,
  COUNT(CASE WHEN challenger_score IS NOT NULL AND opponent_score IS NOT NULL THEN 1 END) as with_scores,
  COUNT(CASE WHEN club_confirmed = TRUE THEN 1 END) as club_confirmed_count
FROM challenges 
GROUP BY status
ORDER BY status;

-- Check pending approvals
SELECT 
  id,
  status,
  challenger_score,
  opponent_score,
  club_confirmed,
  created_at
FROM challenges 
WHERE status = 'pending_approval'
ORDER BY created_at DESC
LIMIT 5;

-- Test the view
SELECT * FROM pending_approvals LIMIT 3;
