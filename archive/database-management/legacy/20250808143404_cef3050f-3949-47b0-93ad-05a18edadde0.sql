-- Phase 1 (cont.): Add helpful indexes for common club- and user-scoped queries

-- Club profiles looked up by user_id
CREATE INDEX IF NOT EXISTS idx_club_profiles_user_id
  ON public.club_profiles (user_id);

-- Tournaments filtered by club_id and status
CREATE INDEX IF NOT EXISTS idx_tournaments_club_id
  ON public.tournaments (club_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_club_status
  ON public.tournaments (club_id, status);

-- Rank requests by club_id and status (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'rank_requests'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_rank_requests_club_id ON public.rank_requests (club_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_rank_requests_club_status ON public.rank_requests (club_id, status)';
  END IF;
END $$;

-- Challenges by club_id and status
CREATE INDEX IF NOT EXISTS idx_challenges_club_id
  ON public.challenges (club_id);
CREATE INDEX IF NOT EXISTS idx_challenges_club_status
  ON public.challenges (club_id, status);

-- Player rankings by user_id
CREATE INDEX IF NOT EXISTS idx_player_rankings_user_id
  ON public.player_rankings (user_id);
