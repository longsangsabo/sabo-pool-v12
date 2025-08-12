-- Add spa_points column to profiles table
-- This is needed for the direct code claim system

-- Add spa_points column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS spa_points INTEGER DEFAULT 0 NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_spa_points ON public.profiles(spa_points DESC);

-- Add comment
COMMENT ON COLUMN public.profiles.spa_points IS 'SPA Points earned by user from tournaments and legacy claims';
