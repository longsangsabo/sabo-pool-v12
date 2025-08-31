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

-- Step 4: Add missing user_roles records for club owners
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT DISTINCT
  p.user_id,
  'club_owner'::app_role,
  NOW() as created_at,
  NOW() as updated_at
FROM public.profiles p
JOIN public.club_profiles cp ON p.user_id = cp.user_id
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id AND ur.role = 'club_owner'
WHERE p.role IN ('club_owner', 'both')
  AND cp.verification_status = 'approved'
  AND ur.id IS NULL;