-- Quick fix SQL if approved users are missing from club_members
-- Run this AFTER identifying the issue with diagnostic-queries.sql

-- First, find your club ID and insert missing users into club_members
WITH sbo_club AS (
  SELECT id as club_id, club_name
  FROM club_profiles 
  WHERE club_name ILIKE '%SBO%' OR club_name ILIKE '%SABO%'
  LIMIT 1
)
INSERT INTO club_members (club_id, user_id, join_date, status, membership_type, role)
SELECT 
  sc.club_id,
  rr.user_id,
  COALESCE(rr.approved_at, NOW()) as join_date,
  'active' as status,
  'regular' as membership_type,
  'member' as role
FROM rank_requests rr
CROSS JOIN sbo_club sc
LEFT JOIN club_members cm ON cm.user_id = rr.user_id AND cm.club_id = sc.club_id
WHERE rr.club_id = sc.club_id
  AND rr.status = 'approved'
  AND cm.user_id IS NULL;  -- Only insert if not already in club_members

-- Verify the fix
WITH sbo_club AS (
  SELECT id as club_id, club_name
  FROM club_profiles 
  WHERE club_name ILIKE '%SBO%' OR club_name ILIKE '%SABO%'
  LIMIT 1
)
SELECT 
  cm.user_id,
  p.full_name,
  p.display_name,
  p.verified_rank,
  cm.join_date,
  cm.status
FROM club_members cm
CROSS JOIN sbo_club sc
JOIN profiles p ON p.user_id = cm.user_id
WHERE cm.club_id = sc.club_id
ORDER BY cm.join_date DESC;
