-- Step 1: Add role column to club_members table
ALTER TABLE public.club_members ADD COLUMN role text DEFAULT 'member';

-- Step 2: Update existing records to have proper roles for club owners
UPDATE public.club_members 
SET role = 'owner'
WHERE user_id IN (
  SELECT cp.user_id 
  FROM public.club_profiles cp
  JOIN public.profiles p ON cp.user_id = p.user_id
  WHERE cp.verification_status = 'approved' 
    AND p.role IN ('club_owner', 'both')
);

-- Step 3: Add missing club_members records for users with club_profiles
INSERT INTO public.club_members (club_id, user_id, role, status, join_date, created_at, updated_at)
SELECT 
  cp.id as club_id,
  cp.user_id,
  'owner' as role,
  'active' as status,
  cp.created_at as join_date,
  NOW() as created_at,
  NOW() as updated_at
FROM public.club_profiles cp
JOIN public.profiles p ON cp.user_id = p.user_id
LEFT JOIN public.club_members cm ON cp.id = cm.club_id AND cp.user_id = cm.user_id
WHERE cm.id IS NULL
  AND cp.verification_status = 'approved'
  AND p.role IN ('club_owner', 'both');

-- Step 4: Add missing user_roles records for club owners (without updated_at column)
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT DISTINCT
  p.user_id,
  'club_owner'::app_role,
  NOW() as created_at
FROM public.profiles p
JOIN public.club_profiles cp ON p.user_id = cp.user_id
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.role = 'club_owner'
WHERE p.role IN ('club_owner', 'both')
  AND cp.verification_status = 'approved'
  AND ur.id IS NULL;

-- Step 5: Create helpful view for club ownership checks
CREATE OR REPLACE VIEW public.club_ownership_status AS
SELECT 
  p.user_id,
  p.role as profile_role,
  cp.id as club_profile_id,
  cp.club_name,
  cp.verification_status,
  cm.role as member_role,
  cm.status as member_status,
  ur.role as user_role,
  CASE 
    WHEN p.role IN ('club_owner', 'both') 
         AND cp.id IS NOT NULL 
         AND cp.verification_status = 'approved' 
    THEN true 
    ELSE false 
  END as is_club_owner
FROM public.profiles p
LEFT JOIN public.club_profiles cp ON p.user_id = cp.user_id
LEFT JOIN public.club_members cm ON cp.id = cm.club_id AND p.user_id = cm.user_id
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.role = 'club_owner';

-- Step 6: Create function to get club profile for user
CREATE OR REPLACE FUNCTION public.get_user_club_profile(p_user_id uuid)
RETURNS TABLE (
  club_id uuid,
  club_name text,
  verification_status text,
  is_owner boolean,
  member_role text,
  member_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as club_id,
    cp.club_name,
    cp.verification_status,
    CASE 
      WHEN p.role IN ('club_owner', 'both') 
           AND cp.verification_status = 'approved' 
      THEN true 
      ELSE false 
    END as is_owner,
    cm.role as member_role,
    cm.status as member_status
  FROM public.profiles p
  LEFT JOIN public.club_profiles cp ON p.user_id = cp.user_id
  LEFT JOIN public.club_members cm ON cp.id = cm.club_id AND p.user_id = cm.user_id
  WHERE p.user_id = p_user_id;
END;
$$;