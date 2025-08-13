-- ===============================================
-- COMPREHENSIVE CHALLENGES TABLE SCHEMA FIX
-- Ensures all form fields are properly stored in database
-- Run this in Supabase SQL Editor
-- ===============================================

-- 1. Add all missing columns that form sends
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS challenger_name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS required_rank TEXT,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_sabo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS handicap_1_rank INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS handicap_05_rank INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bet_points INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS race_to INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES club_profiles(id);

-- 2. Ensure status field supports 'open' status for open challenges
ALTER TABLE challenges 
DROP CONSTRAINT IF EXISTS challenges_status_check;

ALTER TABLE challenges 
ADD CONSTRAINT challenges_status_check 
CHECK (status IN (
  'pending', 'accepted', 'declined', 'completed', 
  'cancelled', 'expired', 'open', 'in_progress'
));

-- 3. Allow opponent_id to be NULL for open challenges
ALTER TABLE challenges 
ALTER COLUMN opponent_id DROP NOT NULL;

-- 4. Add comments for documentation
COMMENT ON COLUMN challenges.challenger_name IS 'Cached challenger name from form submission';
COMMENT ON COLUMN challenges.location IS 'Club name/location where challenge takes place';
COMMENT ON COLUMN challenges.required_rank IS 'Minimum rank required for open challenges (K, I, H, G, F, E, all)';
COMMENT ON COLUMN challenges.message IS 'Challenge message from challenger';
COMMENT ON COLUMN challenges.scheduled_time IS 'When the challenge is scheduled to take place (UTC)';
COMMENT ON COLUMN challenges.is_sabo IS 'Whether SABO handicap system is enabled';
COMMENT ON COLUMN challenges.handicap_1_rank IS 'Handicap for challenger in SABO mode';
COMMENT ON COLUMN challenges.handicap_05_rank IS 'Handicap for opponent in SABO mode';
COMMENT ON COLUMN challenges.bet_points IS 'Points being wagered in the challenge';
COMMENT ON COLUMN challenges.race_to IS 'Race to score (8, 12, 14, 16, 18, 22)';

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_challenger_name ON challenges(challenger_name);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_is_sabo ON challenges(is_sabo);
CREATE INDEX IF NOT EXISTS idx_challenges_required_rank ON challenges(required_rank);
CREATE INDEX IF NOT EXISTS idx_challenges_bet_points ON challenges(bet_points);
CREATE INDEX IF NOT EXISTS idx_challenges_club_id ON challenges(club_id);
CREATE INDEX IF NOT EXISTS idx_challenges_scheduled_time ON challenges(scheduled_time);

-- 6. RLS policies already cleaned up by cleanup-challenges-policies.sql
-- Skip policy creation since they're already set up properly

-- 7. Ensure RLS is enabled
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- 8. Verify the schema changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'challenges' 
AND column_name IN (
  'challenger_name', 'location', 'required_rank', 'message', 
  'scheduled_time', 'is_sabo', 'handicap_1_rank', 'handicap_05_rank',
  'bet_points', 'race_to', 'club_id', 'status'
)
ORDER BY column_name;

-- 9. Check current policies
SELECT 
  policyname, 
  cmd as operation,
  permissive,
  CASE WHEN qual IS NOT NULL THEN 'Has USING clause' ELSE 'No USING clause' END as using_clause,
  CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause' ELSE 'No WITH CHECK clause' END as with_check_clause
FROM pg_policies 
WHERE tablename = 'challenges'
ORDER BY policyname;

-- 10. Test data sample (optional - run only if you want to see current data)
-- SELECT 
--   id,
--   challenger_name,
--   location,
--   required_rank,
--   message,
--   scheduled_time,
--   is_sabo,
--   handicap_1_rank,
--   handicap_05_rank,
--   bet_points,
--   race_to,
--   status,
--   created_at
-- FROM challenges 
-- ORDER BY created_at DESC 
-- LIMIT 5;

-- ===============================================
-- MIGRATION COMPLETED
-- All form fields should now be properly stored
-- ===============================================
