-- Fix profile creation issue by creating RPC function that bypasses PostgREST's automatic ON CONFLICT
-- Root cause: PostgREST automatically adds ON CONFLICT to INSERT operations, but profiles table lacks proper constraints

-- 1. First, let's check what constraints exist
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public';

-- 2. Create RPC function to create profiles safely
CREATE OR REPLACE FUNCTION create_profile_safe(
  p_user_id UUID,
  p_email TEXT DEFAULT NULL,
  p_current_rank TEXT DEFAULT 'K',
  p_spa_points INTEGER DEFAULT 0,
  p_elo INTEGER DEFAULT 1000,
  p_is_admin BOOLEAN DEFAULT FALSE,
  p_skill_level TEXT DEFAULT 'beginner',
  p_ban_status TEXT DEFAULT 'active'
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  email TEXT,
  current_rank TEXT,
  spa_points INTEGER,
  elo INTEGER,
  is_admin BOOLEAN,
  skill_level TEXT,
  ban_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = p_user_id) THEN
    -- Return existing profile
    RETURN QUERY
    SELECT 
      profiles.id,
      profiles.user_id,
      profiles.email,
      profiles.current_rank,
      profiles.spa_points,
      profiles.elo,
      profiles.is_admin,
      profiles.skill_level,
      profiles.ban_status,
      profiles.created_at
    FROM public.profiles 
    WHERE profiles.user_id = p_user_id;
  ELSE
    -- Create new profile
    RETURN QUERY
    INSERT INTO public.profiles (
      user_id, email, current_rank, spa_points, 
      elo, is_admin, skill_level, ban_status
    ) VALUES (
      p_user_id, p_email, p_current_rank, p_spa_points,
      p_elo, p_is_admin, p_skill_level, p_ban_status
    )
    RETURNING 
      profiles.id,
      profiles.user_id,
      profiles.email,
      profiles.current_rank,
      profiles.spa_points,
      profiles.elo,
      profiles.is_admin,
      profiles.skill_level,
      profiles.ban_status,
      profiles.created_at;
  END IF;
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION create_profile_safe TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile_safe TO anon;

-- 4. Test the function
SELECT * FROM create_profile_safe('3af18588-9e16-4857-af98-b1f9d0d2e24a', 'sabomedia28@gmail.com');
