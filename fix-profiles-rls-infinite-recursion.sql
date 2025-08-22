-- Fix infinite recursion in profiles RLS policies
-- This script fixes the error: infinite recursion detected in policy for relation "profiles"

-- Step 1: Drop all problematic policies on profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Step 2: Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Use direct table access instead of RLS-protected query
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Step 3: Create safe RLS policies without recursion
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 4: Create admin policies using security definer function
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Step 5: Service role bypass policy
CREATE POLICY "Service role full access" 
ON public.profiles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Step 6: Grant proper permissions
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE, INSERT ON public.profiles TO authenticated;

-- Step 7: Verification query to test the fix
SELECT 
  'Fix verification' as test_type,
  count(*) as profile_count,
  current_user as current_role
FROM public.profiles
WHERE deleted_at IS NULL;

-- Success message
SELECT 'Profiles RLS infinite recursion fix completed successfully!' as status;
