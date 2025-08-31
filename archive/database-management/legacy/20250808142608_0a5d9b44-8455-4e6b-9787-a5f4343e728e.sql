-- Phase 1: Fix notifications.club_id errors and add initial indexes

-- 1) Add missing club_id column to notifications (nullable for backward compatibility)
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS club_id uuid;

-- Helpful indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read
  ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_club_id
  ON public.notifications (club_id);

-- 2) Initial performance indexes commonly used by the app
-- Matches: composite index for frequent lookups
CREATE INDEX IF NOT EXISTS idx_matches_players_created_at
  ON public.matches (player1_id, player2_id, created_at);

-- Tournament matches: speed up by tournament/round and tournament/status
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tourney_round
  ON public.tournament_matches (tournament_id, round_number);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tourney_status
  ON public.tournament_matches (tournament_id, status);
