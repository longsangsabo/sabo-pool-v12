-- Update some existing challenges with club_id for testing location display
-- First, let's see available club_profiles
SELECT id, club_name, address FROM club_profiles LIMIT 5;

-- Update some challenges with club_id (using the SBO POOL ARENA club)
UPDATE challenges 
SET club_id = (SELECT id FROM club_profiles WHERE club_name = 'SBO POOL ARENA' LIMIT 1)
WHERE status = 'pending' 
  AND opponent_id IS NULL 
  AND club_id IS NULL
  AND id IN (
    SELECT id FROM challenges 
    WHERE status = 'pending' 
      AND opponent_id IS NULL 
      AND club_id IS NULL 
    LIMIT 3
  );

-- Verify the update
SELECT id, club_id, status, created_at 
FROM challenges 
WHERE club_id IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;

-- Show challenges with club info
SELECT 
  c.id,
  c.status,
  c.club_id,
  cp.club_name,
  cp.address
FROM challenges c
LEFT JOIN club_profiles cp ON c.club_id = cp.id
WHERE c.status = 'pending' 
  AND c.opponent_id IS NULL
ORDER BY c.created_at DESC
LIMIT 5;
