-- Fix role system inconsistencies and security issues

-- 1. First, sync data between old and new systems
-- Find users who are admin in profiles but not in user_roles
INSERT INTO user_roles (user_id, role, created_by)
SELECT 
    p.user_id,
    'admin'::app_role,
    p.user_id
FROM profiles p
WHERE p.is_admin = true
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id 
    AND ur.role = 'admin'
);

-- 2. Find users who are admin in user_roles but not in profiles
UPDATE profiles 
SET is_admin = true
WHERE user_id IN (
    SELECT ur.user_id 
    FROM user_roles ur 
    WHERE ur.role = 'admin'
    AND NOT EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = ur.user_id 
        AND p.is_admin = true
    )
);

-- 3. Drop existing functions if they exist and create enhanced role checking functions
DROP FUNCTION IF EXISTS public.get_user_roles(UUID);
DROP FUNCTION IF EXISTS public.user_has_role(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_user_primary_role(UUID);

-- Create enhanced role checking function
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TEXT[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    array_agg(role::TEXT ORDER BY role),
    ARRAY[]::TEXT[]
  )
  FROM public.user_roles
  WHERE user_id = _user_id;
$$;

-- 4. Create function to check specific role
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role::TEXT = _role
  );
$$;

-- 5. Create function to get user primary role for navigation
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (
      SELECT role::TEXT
      FROM public.user_roles
      WHERE user_id = _user_id
      ORDER BY 
        CASE role::TEXT
          WHEN 'admin' THEN 1
          WHEN 'moderator' THEN 2
          WHEN 'club_owner' THEN 3
          WHEN 'user' THEN 4
          ELSE 5
        END
      LIMIT 1
    ),
    'user'
  );
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_primary_role(UUID) TO authenticated;

-- 7. Verification query
SELECT 
    p.display_name,
    p.user_id,
    p.is_admin as old_admin,
    public.get_user_roles(p.user_id) as new_roles,
    public.get_user_primary_role(p.user_id) as primary_role,
    public.user_has_role(p.user_id, 'admin') as is_admin_new
FROM profiles p
WHERE p.is_admin = true OR EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id 
    AND ur.role IN ('admin', 'moderator', 'club_owner')
)
ORDER BY p.display_name;
