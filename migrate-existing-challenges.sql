-- Migration script to update existing challenges
-- Run this after adding the new columns

-- 1. First, add the new columns (if not already added)
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS club_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS club_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS club_confirmed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS club_note TEXT;

-- 2. Update existing challenges that have scores but are still in 'accepted' status
-- These should be moved to 'pending_approval' status
UPDATE challenges 
SET 
  status = 'pending_approval',
  club_confirmed = FALSE
WHERE status = 'accepted' 
  AND challenger_score IS NOT NULL 
  AND opponent_score IS NOT NULL 
  AND club_confirmed IS NULL;

-- 3. Check the results
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN challenger_score IS NOT NULL AND opponent_score IS NOT NULL THEN 1 END) as with_scores
FROM challenges 
GROUP BY status
ORDER BY status;

-- 4. Show pending approvals
SELECT 
  id,
  status,
  challenger_score,
  opponent_score,
  club_confirmed,
  created_at,
  CASE 
    WHEN club_id IS NOT NULL THEN 'Has Club'
    ELSE 'No Club'
  END as club_status
FROM challenges 
WHERE status = 'pending_approval'
ORDER BY created_at DESC
LIMIT 10;
