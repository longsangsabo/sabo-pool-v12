-- Fix foreign key relationships for production compatibility
-- This migration ensures that all tables have proper foreign key constraints
-- that match both development and production environments

-- First, check if matches table exists and has proper foreign keys
DO $$
BEGIN
  -- Check if matches table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN
    RAISE NOTICE 'Matches table exists, checking foreign keys...';
    
    -- Check if foreign key constraints exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%matches_player1_id%' 
      AND table_name = 'matches'
    ) THEN
      RAISE NOTICE 'Adding missing foreign key constraint for matches.player1_id';
      ALTER TABLE public.matches 
      ADD CONSTRAINT matches_player1_id_fkey 
      FOREIGN KEY (player1_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%matches_player2_id%' 
      AND table_name = 'matches'
    ) THEN
      RAISE NOTICE 'Adding missing foreign key constraint for matches.player2_id';
      ALTER TABLE public.matches 
      ADD CONSTRAINT matches_player2_id_fkey 
      FOREIGN KEY (player2_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%matches_winner_id%' 
      AND table_name = 'matches'
    ) THEN
      RAISE NOTICE 'Adding missing foreign key constraint for matches.winner_id';
      ALTER TABLE public.matches 
      ADD CONSTRAINT matches_winner_id_fkey 
      FOREIGN KEY (winner_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
    END IF;
  ELSE
    RAISE NOTICE 'Matches table does not exist - this is expected in some environments';
  END IF;
  
  -- Check tournament_matches table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournament_matches') THEN
    RAISE NOTICE 'Tournament matches table exists, checking foreign keys...';
    
    -- Ensure tournament_matches has proper constraints
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%tournament_matches_player1_id%' 
      AND table_name = 'tournament_matches'
    ) THEN
      RAISE NOTICE 'Adding missing foreign key constraint for tournament_matches.player1_id';
      ALTER TABLE public.tournament_matches 
      ADD CONSTRAINT tournament_matches_player1_id_fkey 
      FOREIGN KEY (player1_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%tournament_matches_player2_id%' 
      AND table_name = 'tournament_matches'
    ) THEN
      RAISE NOTICE 'Adding missing foreign key constraint for tournament_matches.player2_id';
      ALTER TABLE public.tournament_matches 
      ADD CONSTRAINT tournament_matches_player2_id_fkey 
      FOREIGN KEY (player2_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;

-- Update RLS policies for better production compatibility
-- Fix club_profiles RLS policy that might be causing 406 errors
DROP POLICY IF EXISTS "Club profiles are viewable by everyone" ON public.club_profiles;
CREATE POLICY "Club profiles are viewable by everyone" 
ON public.club_profiles FOR SELECT 
USING (true);

-- Ensure profiles table has proper RLS
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Add helpful indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_player1_id ON public.matches(player1_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_player2_id ON public.matches(player2_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_winner_id ON public.matches(winner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_created_at ON public.matches(created_at);

-- Log completion
INSERT INTO public.system_logs (log_type, message, metadata) 
VALUES (
  'database_fix', 
  'Production foreign key relationship fix completed',
  jsonb_build_object(
    'timestamp', NOW(),
    'migration', 'production_relationship_fix',
    'tables_checked', ARRAY['matches', 'tournament_matches', 'club_profiles', 'profiles']
  )
) ON CONFLICT DO NOTHING;
