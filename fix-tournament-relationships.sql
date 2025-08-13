-- Fix tournament_registrations relationship issues
-- Date: 2025-01-13
-- Purpose: Resolve schema cache relationship errors

-- 1. Drop and recreate foreign key constraints with proper names
ALTER TABLE public.tournament_registrations 
DROP CONSTRAINT IF EXISTS tournament_registrations_tournament_id_fkey CASCADE;

ALTER TABLE public.tournament_registrations 
DROP CONSTRAINT IF EXISTS tournament_registrations_user_id_fkey CASCADE;

ALTER TABLE public.tournament_registrations 
DROP CONSTRAINT IF EXISTS tournament_registrations_player_id_fkey CASCADE;

-- 2. Clean up any orphaned registrations
DELETE FROM public.tournament_registrations 
WHERE tournament_id NOT IN (SELECT id FROM public.tournaments WHERE id IS NOT NULL);

DELETE FROM public.tournament_registrations 
WHERE user_id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL);

-- 3. Recreate foreign key constraints with explicit names
ALTER TABLE public.tournament_registrations 
ADD CONSTRAINT tournament_registrations_tournament_id_fkey 
FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id) ON DELETE CASCADE;

ALTER TABLE public.tournament_registrations 
ADD CONSTRAINT tournament_registrations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 4. Update tournament participant counts to match actual registrations
UPDATE public.tournaments 
SET current_participants = (
  SELECT COUNT(*) 
  FROM public.tournament_registrations 
  WHERE tournament_id = tournaments.id
),
updated_at = now()
WHERE id IN (
  SELECT DISTINCT tournament_id 
  FROM public.tournament_registrations
);

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament_user 
ON public.tournament_registrations(tournament_id, user_id);

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status 
ON public.tournament_registrations(registration_status);

-- 6. Force PostgREST schema reload (if function exists)
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION WHEN others THEN
  NULL; -- Ignore if notification fails
END $$;

-- Verify the fix
SELECT 
  'tournament_registrations' as table_name,
  COUNT(*) as total_registrations,
  COUNT(DISTINCT tournament_id) as tournaments_with_registrations,
  COUNT(DISTINCT user_id) as unique_participants
FROM public.tournament_registrations;
