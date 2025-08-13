-- Update some existing challenges with test data to verify display functionality
-- This will help test the Club and Rank Information section in EnhancedChallengeCard

-- First, let's see what challenges we have
SELECT id, location, required_rank, status, created_at 
FROM challenges 
ORDER BY created_at DESC 
LIMIT 5;

-- Update a few challenges with location and required_rank data for testing
UPDATE challenges 
SET 
  location = 'SBO POOL ARENA - CLB Bi-a Chuyên nghiệp',
  required_rank = 'G'
WHERE status = 'pending' 
  AND opponent_id IS NULL 
  AND (location IS NULL OR location = '')
  AND id IN (
    SELECT id FROM challenges 
    WHERE status = 'pending' 
      AND opponent_id IS NULL 
    ORDER BY created_at DESC 
    LIMIT 2
  );

-- Update another challenge with different data
UPDATE challenges 
SET 
  location = 'DIAMOND BILLIARDS CLUB - Quận 1',
  required_rank = 'H'
WHERE status = 'pending' 
  AND (location IS NULL OR location = '')
  AND id IN (
    SELECT id FROM challenges 
    WHERE status = 'pending' 
    ORDER BY created_at DESC 
    LIMIT 1
  );

-- Verify the updates
SELECT 
  id,
  challenger_id,
  location,
  required_rank,
  bet_points,
  status,
  created_at
FROM challenges 
WHERE location IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

-- Show summary
SELECT 
  COUNT(*) as total_challenges,
  COUNT(CASE WHEN location IS NOT NULL AND location != '' THEN 1 END) as with_location,
  COUNT(CASE WHEN required_rank IS NOT NULL AND required_rank != 'all' THEN 1 END) as with_required_rank
FROM challenges
WHERE created_at > NOW() - INTERVAL '7 days';
