-- Diagnostic SQL to find the issue with club members display
-- Run these queries one by one in Supabase Dashboard

-- Step 1: Find the exact SBO club ID
SELECT id, club_name, user_id, created_at 
FROM club_profiles 
WHERE club_name ILIKE '%SBO%' OR club_name ILIKE '%SABO%';

-- Step 2: Replace 'YOUR_CLUB_ID_HERE' with the actual club ID from Step 1
-- Check club members for that specific club
SELECT 
  user_id,
  status,
  join_date,
  membership_type,
  created_at
FROM club_members 
WHERE club_id = 'YOUR_CLUB_ID_HERE'
ORDER BY join_date DESC;

-- Step 3: Check approved rank requests for that club
SELECT 
  user_id,
  requested_rank,
  status,
  approved_at,
  approved_by,
  created_at
FROM rank_requests 
WHERE club_id = 'YOUR_CLUB_ID_HERE' 
  AND status = 'approved'
ORDER BY approved_at DESC;

-- Step 4: The CRUCIAL QUERY - Find users who were approved but NOT added to club_members
SELECT 
  rr.user_id,
  rr.requested_rank,
  rr.approved_at,
  p.full_name,
  p.display_name,
  p.verified_rank,
  CASE 
    WHEN cm.user_id IS NULL THEN '❌ MISSING from club_members'
    ELSE '✅ Present in club_members'
  END as club_member_status
FROM rank_requests rr
JOIN profiles p ON p.user_id = rr.user_id
LEFT JOIN club_members cm ON cm.user_id = rr.user_id AND cm.club_id = rr.club_id
WHERE rr.club_id = 'YOUR_CLUB_ID_HERE' 
  AND rr.status = 'approved'
ORDER BY rr.approved_at DESC;

-- Step 5: Check if approve_rank_request function exists
SELECT 
  proname as function_name,
  prokind,
  proargnames,
  prosrc
FROM pg_proc 
WHERE proname = 'approve_rank_request';

-- Step 6: If you want to manually add missing users to club_members
-- (Replace the values with actual data from Step 4)
/*
INSERT INTO club_members (club_id, user_id, join_date, status)
VALUES ('YOUR_CLUB_ID_HERE', 'USER_ID_HERE', NOW(), NULL)
ON CONFLICT (club_id, user_id) DO NOTHING;
*/
