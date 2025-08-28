-- Create sample data using existing users or create proper auth users
-- Run this in Supabase SQL Editor

-- Option 1: Use existing users if any
WITH existing_users AS (
  SELECT id FROM auth.users LIMIT 4
),
sample_profiles AS (
  INSERT INTO profiles (user_id, full_name, avatar_url) 
  SELECT 
    id,
    CASE 
      WHEN ROW_NUMBER() OVER (ORDER BY id) = 1 THEN 'Nguyễn Văn Anh'
      WHEN ROW_NUMBER() OVER (ORDER BY id) = 2 THEN 'Trần Thị Bảo'  
      WHEN ROW_NUMBER() OVER (ORDER BY id) = 3 THEN 'Lê Minh Cường'
      ELSE 'Phạm Thu Dung'
    END,
    'https://avatar.iran.liara.run/public/boy?username=' || SUBSTRING(id::text, 1, 8)
  FROM existing_users
  ON CONFLICT (user_id) DO NOTHING
  RETURNING user_id, full_name
)
SELECT 'Created profiles' as action, COUNT(*) as count FROM sample_profiles;

-- Check if we have enough users
SELECT 
  'Auth Users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Profiles',
  COUNT(*)
FROM profiles;

-- Option 2: If no existing users, let's create challenges with NULL user references for demo
-- This is just for UI testing - normally you'd have real authenticated users

-- First check existing profiles
DO $$
DECLARE 
  profile_count INTEGER;
  user_ids UUID[];
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  
  IF profile_count < 4 THEN
    -- Create demo profiles with generated UUIDs (bypass auth constraint temporarily)
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
    
    INSERT INTO profiles (user_id, full_name, avatar_url) 
    VALUES 
      ('550e8400-e29b-41d4-a716-446655440001', 'Nguyễn Văn Anh Demo', 'https://avatar.iran.liara.run/public/boy?username=anh'),
      ('550e8400-e29b-41d4-a716-446655440002', 'Trần Thị Bảo Demo', 'https://avatar.iran.liara.run/public/girl?username=bao'),
      ('550e8400-e29b-41d4-a716-446655440003', 'Lê Minh Cường Demo', 'https://avatar.iran.liara.run/public/boy?username=cuong'),
      ('550e8400-e29b-41d4-a716-446655440004', 'Phạm Thu Dung Demo', 'https://avatar.iran.liara.run/public/girl?username=dung')
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Created demo profiles without auth constraint';
  END IF;
  
  -- Get existing profile user_ids
  SELECT ARRAY(SELECT user_id FROM profiles LIMIT 4) INTO user_ids;
  
  -- Create sample challenges using existing profile user_ids
  IF array_length(user_ids, 1) >= 2 THEN
    INSERT INTO challenges (
      id,
      challenger_id,
      opponent_id,
      status,
      bet_points,
      race_to,
      challenger_score,
      opponent_score,
      club_confirmed,
      scheduled_time,
      created_at
    ) VALUES 
      -- Pending challenges
      (gen_random_uuid(), user_ids[1], user_ids[2], 'pending', 100, 5, NULL, NULL, FALSE, NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 hour'),
      (gen_random_uuid(), user_ids[2], COALESCE(user_ids[3], user_ids[1]), 'pending', 150, 5, NULL, NULL, FALSE, NOW() + INTERVAL '2 days', NOW() - INTERVAL '2 hours'),
      
      -- Accepted challenges (with scores)  
      (gen_random_uuid(), user_ids[1], COALESCE(user_ids[3], user_ids[2]), 'accepted', 200, 5, 5, 3, FALSE, NOW() + INTERVAL '1 day', NOW() - INTERVAL '3 hours'),
      (gen_random_uuid(), user_ids[2], COALESCE(user_ids[4], user_ids[1]), 'accepted', 180, 5, 5, 4, FALSE, NOW() + INTERVAL '3 days', NOW() - INTERVAL '4 hours'),
      
      -- Pending approval challenges
      (gen_random_uuid(), COALESCE(user_ids[3], user_ids[1]), COALESCE(user_ids[4], user_ids[2]), 'pending_approval', 250, 5, 5, 2, FALSE, NOW() + INTERVAL '1 day', NOW() - INTERVAL '5 hours'),
      (gen_random_uuid(), user_ids[1], COALESCE(user_ids[4], user_ids[2]), 'pending_approval', 300, 5, 5, 4, FALSE, NOW() + INTERVAL '2 days', NOW() - INTERVAL '6 hours'),
      
      -- Completed challenges
      (gen_random_uuid(), user_ids[2], COALESCE(user_ids[3], user_ids[1]), 'completed', 400, 5, 5, 1, TRUE, NOW() + INTERVAL '1 day', NOW() - INTERVAL '7 hours'),
      (gen_random_uuid(), COALESCE(user_ids[3], user_ids[1]), user_ids[1], 'completed', 350, 5, 5, 3, TRUE, NOW() + INTERVAL '3 days', NOW() - INTERVAL '8 hours')
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created sample challenges using % profiles', array_length(user_ids, 1);
  END IF;
END $$;

-- Final check
SELECT 
  'Results' as section,
  status,
  COUNT(*) as count
FROM challenges
GROUP BY status
ORDER BY status;

SELECT 'Total' as section, '' as status, COUNT(*) as count FROM challenges;
SELECT 'Profiles' as section, '' as status, COUNT(*) as count FROM profiles;
