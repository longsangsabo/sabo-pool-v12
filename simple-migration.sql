-- Simple step-by-step SQL migration
-- Run each section separately in Supabase SQL Editor

-- STEP 0: Add missing club_profiles.name column
ALTER TABLE club_profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing club_profiles with default name if empty
UPDATE club_profiles 
SET name = 'Club ' || id::text 
WHERE name IS NULL OR name = '';

-- STEP 1: Update status constraint
DO $$
BEGIN
  ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_status_check;
  ALTER TABLE challenges ADD CONSTRAINT challenges_status_check 
  CHECK (status IN (
    'pending', 'open', 'accepted', 'declined', 'ongoing', 
    'pending_approval', 'completed', 'rejected', 'cancelled', 'expired'
  ));
END $$;

-- STEP 2: Add club confirmation columns
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS club_confirmed BOOLEAN DEFAULT FALSE;

ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS club_confirmed_at TIMESTAMPTZ;

ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS club_confirmed_by UUID REFERENCES auth.users(id);

ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS club_note TEXT;

-- STEP 3: Add indexes
CREATE INDEX IF NOT EXISTS idx_challenges_club_confirmed ON challenges(club_confirmed);

-- STEP 4: Update existing data
UPDATE challenges 
SET status = 'pending_approval'
WHERE status = 'accepted' 
  AND challenger_score IS NOT NULL 
  AND opponent_score IS NOT NULL 
  AND (club_confirmed IS NULL OR club_confirmed = FALSE);

-- STEP 5: Check results
SELECT 
  status, 
  COUNT(*) as count,
  COUNT(CASE WHEN challenger_score IS NOT NULL AND opponent_score IS NOT NULL THEN 1 END) as with_scores,
  COUNT(CASE WHEN club_confirmed = TRUE THEN 1 END) as club_confirmed_count
FROM challenges 
GROUP BY status
ORDER BY status;

-- STEP 6: Optional - Create view for pending approvals
DROP VIEW IF EXISTS pending_approvals;
CREATE VIEW pending_approvals AS
SELECT 
  c.id,
  c.status,
  c.challenger_id,
  c.opponent_id,
  c.club_id,
  c.challenger_score,
  c.opponent_score,
  c.club_confirmed,
  c.created_at,
  c.scheduled_time,
  c.bet_points,
  cp_challenger.full_name as challenger_full_name,
  cp_opponent.full_name as opponent_full_name,
  club.name as club_name
FROM challenges c
LEFT JOIN profiles cp_challenger ON c.challenger_id = cp_challenger.user_id
LEFT JOIN profiles cp_opponent ON c.opponent_id = cp_opponent.user_id
LEFT JOIN club_profiles club ON c.club_id = club.id
WHERE c.status = 'pending_approval'
  AND c.challenger_score IS NOT NULL 
  AND c.opponent_score IS NOT NULL 
  AND c.club_confirmed = FALSE;
