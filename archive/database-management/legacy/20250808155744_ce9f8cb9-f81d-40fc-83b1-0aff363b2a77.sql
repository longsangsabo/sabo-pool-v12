-- Step 1: Fix missing data for existing club owners
-- Add missing club_members records for users with club_profiles
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
LEFT JOIN public.club_members cm ON cp.id = cm.club_id AND cp.user_id = cm.user_id
WHERE cm.id IS NULL
  AND cp.verification_status = 'approved';

-- Step 2: Add missing user_roles records for club owners
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT DISTINCT
  p.user_id,
  'club_owner'::app_role,
  NOW() as created_at,
  NOW() as updated_at
FROM public.profiles p
JOIN public.club_profiles cp ON p.user_id = cp.user_id
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.role = 'club_owner'
WHERE p.role = 'club_owner'
  AND cp.verification_status = 'approved'
  AND ur.id IS NULL;

-- Step 3: Ensure club_members table has the 'role' column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'club_members' 
    AND column_name = 'role' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.club_members ADD COLUMN role text DEFAULT 'member';
    
    -- Update existing records to have proper roles
    UPDATE public.club_members 
    SET role = 'owner'
    WHERE user_id IN (
      SELECT user_id FROM public.club_profiles 
      WHERE verification_status = 'approved'
    );
  END IF;
END $$;

-- Step 4: Create helpful view for club ownership checks
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

-- Step 5: Create function to get club profile for user
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