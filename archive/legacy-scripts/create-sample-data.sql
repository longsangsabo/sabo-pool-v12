-- Create sample data for testing club confirmation workflow
-- Run this in Supabase SQL Editor to populate database with test data

-- 1. First, ensure we have some profiles
INSERT INTO profiles (user_id, full_name, avatar_url) 
VALUES 
  (gen_random_uuid(), 'Nguyễn Văn Anh', 'https://avatar.iran.liara.run/public/boy?username=anh'),
  (gen_random_uuid(), 'Trần Thị Bảo', 'https://avatar.iran.liara.run/public/girl?username=bao'),
  (gen_random_uuid(), 'Lê Minh Cường', 'https://avatar.iran.liara.run/public/boy?username=cuong'),
  (gen_random_uuid(), 'Phạm Thu Dung', 'https://avatar.iran.liara.run/public/girl?username=dung'),
  (gen_random_uuid(), 'Hoàng Văn Em', 'https://avatar.iran.liara.run/public/boy?username=em')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Create some club profiles
INSERT INTO club_profiles (id, name, user_id, description, location)
SELECT 
  gen_random_uuid(),
  'SABO Pool Club',
  p.user_id,
  'Câu lạc bộ Billiards SABO chuyên nghiệp',
  'TP. Hồ Chí Minh'
FROM profiles p
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO club_profiles (id, name, user_id, description, location)  
SELECT 
  gen_random_uuid(),
  'Diamond Billiards',
  p.user_id,
  'Câu lạc bộ Diamond Billiards cao cấp',
  'Hà Nội'
FROM profiles p
OFFSET 1 LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- 3. Create sample challenges with different statuses
WITH profile_data AS (
  SELECT user_id, full_name, ROW_NUMBER() OVER (ORDER BY user_id) as rn
  FROM profiles
  LIMIT 5
),
club_data AS (
  SELECT id as club_id, ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM club_profiles
  LIMIT 2
)
INSERT INTO challenges (
  id,
  challenger_id,
  opponent_id,
  club_id,
  status,
  bet_points,
  race_to,
  challenger_score,
  opponent_score,
  club_confirmed,
  scheduled_time,
  created_at
)
SELECT 
  gen_random_uuid(),
  p1.user_id,
  p2.user_id,
  c.club_id,
  status_data.status,
  status_data.bet_points,
  status_data.race_to,
  status_data.challenger_score,
  status_data.opponent_score,
  status_data.club_confirmed,
  NOW() + INTERVAL '1 day',
  NOW() - INTERVAL '1 hour'
FROM profile_data p1
CROSS JOIN profile_data p2
CROSS JOIN club_data c
CROSS JOIN (
  VALUES 
    ('pending', 100, 5, NULL, NULL, FALSE),
    ('accepted', 150, 5, 5, 3, FALSE),
    ('pending_approval', 200, 5, 5, 4, FALSE),
    ('completed', 300, 5, 5, 2, TRUE),
    ('rejected', 120, 3, 3, 2, FALSE)
) AS status_data(status, bet_points, race_to, challenger_score, opponent_score, club_confirmed)
WHERE p1.rn = 1 AND p2.rn = 2 AND c.rn = 1
ON CONFLICT (id) DO NOTHING;

-- 4. Add more challenges with different combinations
WITH profile_data AS (
  SELECT user_id, full_name, ROW_NUMBER() OVER (ORDER BY user_id) as rn
  FROM profiles
  LIMIT 5
)
INSERT INTO challenges (
  id,
  challenger_id,
  opponent_id,
  club_id,
  status,
  bet_points,
  race_to,
  scheduled_time,
  created_at
)
SELECT 
  gen_random_uuid(),
  p1.user_id,
  p2.user_id,
  NULL, -- No club challenges
  'open',
  50,
  3,
  NOW() + INTERVAL '2 days',
  NOW() - INTERVAL '30 minutes'
FROM profile_data p1
CROSS JOIN profile_data p2
WHERE p1.rn = 3 AND p2.rn = 4
ON CONFLICT (id) DO NOTHING;

-- 5. Check results
SELECT 
  'Total Challenges' as metric,
  COUNT(*) as count
FROM challenges
UNION ALL
SELECT 
  'By Status: ' || status,
  COUNT(*)
FROM challenges
GROUP BY status
UNION ALL  
SELECT 
  'Total Profiles',
  COUNT(*)
FROM profiles
UNION ALL
SELECT
  'Total Clubs', 
  COUNT(*)
FROM club_profiles
ORDER BY metric;
