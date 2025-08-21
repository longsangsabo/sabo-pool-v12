-- SQL Scripts to check SBO POOL ARENA club data
-- Run these in Supabase Dashboard > SQL Editor

-- 1. Find all clubs with "SBO" or "SABO" in name
SELECT 
  id,
  club_name,
  user_id as owner_id,
  created_at,
  description
FROM club_profiles 
WHERE club_name ILIKE '%SBO%' OR club_name ILIKE '%SABO%'
ORDER BY created_at DESC;

-- 2. Get club members for SBO clubs
SELECT 
  cm.club_id,
  cp.club_name as club_name,
  cm.user_id,
  cm.status,
  cm.join_date,
  cm.membership_type
FROM club_members cm
JOIN club_profiles cp ON cm.club_id = cp.id
WHERE cp.club_name ILIKE '%SBO%' OR cp.club_name ILIKE '%SABO%'
ORDER BY cm.join_date DESC;

-- 3. Get rank requests for SBO clubs
SELECT 
  rr.id,
  rr.user_id,
  rr.requested_rank,
  rr.status,
  rr.created_at,
  rr.approved_at,
  rr.approved_by,
  cp.club_name as club_name
FROM rank_requests rr
JOIN club_profiles cp ON rr.club_id = cp.id
WHERE cp.club_name ILIKE '%SBO%' OR cp.club_name ILIKE '%SABO%'
ORDER BY rr.created_at DESC;

-- 4. Get approved rank requests with user profiles
SELECT 
  rr.id as request_id,
  rr.requested_rank,
  rr.status,
  rr.approved_at,
  p.user_id,
  p.full_name,
  p.display_name,
  p.verified_rank,
  p.elo,
  cp.club_name as club_name
FROM rank_requests rr
JOIN club_profiles cp ON rr.club_id = cp.id
JOIN profiles p ON rr.user_id = p.user_id
WHERE (cp.club_name ILIKE '%SBO%' OR cp.club_name ILIKE '%SABO%')
  AND rr.status = 'approved'
ORDER BY rr.approved_at DESC;

-- 5. Check if approved users are in club_members table
SELECT 
  rr.user_id,
  p.full_name,
  p.display_name,
  rr.requested_rank,
  p.verified_rank,
  rr.approved_at,
  CASE 
    WHEN cm.user_id IS NOT NULL THEN 'YES - In club_members'
    ELSE 'NO - Missing from club_members'
  END as in_club_members,
  cm.status as member_status,
  cm.join_date
FROM rank_requests rr
JOIN club_profiles cp ON rr.club_id = cp.id
JOIN profiles p ON rr.user_id = p.user_id
LEFT JOIN club_members cm ON cm.user_id = rr.user_id AND cm.club_id = rr.club_id
WHERE (cp.club_name ILIKE '%SBO%' OR cp.club_name ILIKE '%SABO%')
  AND rr.status = 'approved'
ORDER BY rr.approved_at DESC;

-- 6. Summary count
SELECT 
  cp.club_name as club_name,
  COUNT(DISTINCT cm.user_id) as total_club_members,
  COUNT(DISTINCT CASE WHEN rr.status = 'approved' THEN rr.user_id END) as approved_rank_requests,
  COUNT(DISTINCT CASE WHEN rr.status = 'pending' THEN rr.user_id END) as pending_rank_requests
FROM club_profiles cp
LEFT JOIN club_members cm ON cm.club_id = cp.id
LEFT JOIN rank_requests rr ON rr.club_id = cp.id
WHERE cp.club_name ILIKE '%SBO%' OR cp.club_name ILIKE '%SABO%'
GROUP BY cp.id, cp.club_name;

-- 7. All users with verified ranks (regardless of club)
SELECT 
  user_id,
  full_name,
  display_name,
  verified_rank,
  elo,
  updated_at
FROM profiles 
WHERE verified_rank IS NOT NULL
ORDER BY updated_at DESC;
