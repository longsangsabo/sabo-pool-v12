-- Create SBO POOL ARENA club
-- Run this in Supabase Dashboard > SQL Editor

INSERT INTO club_profiles (
  id,
  club_name,
  description,
  user_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'SBO POOL ARENA',
  'Câu lạc bộ Billiards SBO Pool Arena - Nơi hội tụ những tay cơ thủ đam mê',
  (SELECT user_id FROM profiles LIMIT 1), -- Use first available user as owner
  NOW(),
  NOW()
) 
ON CONFLICT (club_name) DO NOTHING;

-- Verify the club was created
SELECT id, club_name, description, user_id, created_at 
FROM club_profiles 
WHERE club_name = 'SBO POOL ARENA';
