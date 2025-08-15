-- Add club confirmation columns to challenges table
-- Run this in Supabase SQL Editor

-- 1. Add club confirmation fields
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS club_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS club_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS club_confirmed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS club_note TEXT;

-- 2. Add index for performance
CREATE INDEX IF NOT EXISTS idx_challenges_club_confirmed ON challenges(club_confirmed);
CREATE INDEX IF NOT EXISTS idx_challenges_status_scores ON challenges(status, challenger_score, opponent_score) 
WHERE challenger_score IS NOT NULL AND opponent_score IS NOT NULL;

-- 3. Add RLS policies for club confirmation
CREATE POLICY IF NOT EXISTS "Club owners can confirm challenges" ON challenges
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM club_profiles 
    WHERE club_profiles.id = challenges.club_id 
    AND club_profiles.user_id = auth.uid()
  )
);

-- 4. Update existing challenges with scores but no club confirmation
-- These should be in 'pending_approval' status waiting for club confirmation
UPDATE challenges 
SET status = 'pending_approval'
WHERE status = 'accepted' 
  AND challenger_score IS NOT NULL 
  AND opponent_score IS NOT NULL 
  AND club_confirmed = FALSE;

-- 5. Add comment for documentation
COMMENT ON COLUMN challenges.club_confirmed IS 'Whether the club has confirmed the match result';
COMMENT ON COLUMN challenges.club_confirmed_at IS 'Timestamp when club confirmed the result';
COMMENT ON COLUMN challenges.club_confirmed_by IS 'User ID of club admin who confirmed';
COMMENT ON COLUMN challenges.club_note IS 'Optional note from club admin';

-- 6. Create function to handle club confirmation and status transition
CREATE OR REPLACE FUNCTION handle_club_confirmation(
  challenge_id UUID,
  confirmed BOOLEAN,
  admin_note TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update challenge with club confirmation
  UPDATE challenges 
  SET 
    club_confirmed = confirmed,
    club_confirmed_at = NOW(),
    club_confirmed_by = auth.uid(),
    club_note = admin_note,
    status = CASE 
      WHEN confirmed = TRUE THEN 'completed'
      ELSE 'rejected'
    END,
    completed_at = CASE 
      WHEN confirmed = TRUE THEN NOW()
      ELSE completed_at
    END
  WHERE id = challenge_id
    AND status = 'pending_approval';
    
  -- Return success
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permission on function
GRANT EXECUTE ON FUNCTION handle_club_confirmation TO authenticated;

-- 8. Create view for pending approvals (optional, for easier querying)
CREATE OR REPLACE VIEW pending_approvals AS
SELECT 
  c.*,
  cp_challenger.full_name as challenger_name,
  cp_opponent.full_name as opponent_name,
  club.name as club_name
FROM challenges c
LEFT JOIN profiles cp_challenger ON c.challenger_id = cp_challenger.user_id
LEFT JOIN profiles cp_opponent ON c.opponent_id = cp_opponent.user_id
LEFT JOIN club_profiles club ON c.club_id = club.id
WHERE c.status = 'pending_approval'
  AND c.challenger_score IS NOT NULL 
  AND c.opponent_score IS NOT NULL 
  AND c.club_confirmed = FALSE;

-- Grant access to view
GRANT SELECT ON pending_approvals TO authenticated;
