-- SQL COMMAND 1: ADD SPA_POINTS COLUMN
-- Copy và paste vào Supabase SQL Editor, chạy đầu tiên

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS spa_points INTEGER DEFAULT 0 NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_spa_points ON public.profiles(spa_points DESC);

COMMENT ON COLUMN public.profiles.spa_points IS 'SPA Points earned by user from tournaments and legacy claims';
