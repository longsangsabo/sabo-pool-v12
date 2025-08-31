-- Milestone System RLS & Policies
-- Timestamp: 2025-08-11 09:45:00
-- Adds row level security & policies for new milestone system tables

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_login_streaks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running (idempotent safety)
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE tablename = 'milestones' AND policyname = 'Public can read milestones';
  IF FOUND THEN EXECUTE 'DROP POLICY "Public can read milestones" ON public.milestones'; END IF;
  PERFORM 1 FROM pg_policies WHERE tablename = 'player_milestones' AND policyname = 'Users read own player_milestones';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users read own player_milestones" ON public.player_milestones'; END IF;
  PERFORM 1 FROM pg_policies WHERE tablename = 'player_milestones' AND policyname = 'System manage player_milestones';
  IF FOUND THEN EXECUTE 'DROP POLICY "System manage player_milestones" ON public.player_milestones'; END IF;
  PERFORM 1 FROM pg_policies WHERE tablename = 'player_daily_progress' AND policyname = 'Users read own daily_progress';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users read own daily_progress" ON public.player_daily_progress'; END IF;
  PERFORM 1 FROM pg_policies WHERE tablename = 'player_daily_progress' AND policyname = 'System manage daily_progress';
  IF FOUND THEN EXECUTE 'DROP POLICY "System manage daily_progress" ON public.player_daily_progress'; END IF;
  PERFORM 1 FROM pg_policies WHERE tablename = 'player_login_streaks' AND policyname = 'Users read own login_streaks';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users read own login_streaks" ON public.player_login_streaks'; END IF;
  PERFORM 1 FROM pg_policies WHERE tablename = 'player_login_streaks' AND policyname = 'System manage login_streaks';
  IF FOUND THEN EXECUTE 'DROP POLICY "System manage login_streaks" ON public.player_login_streaks'; END IF;
END$$;

-- milestones: public read, only service role (supabase backend) can write
CREATE POLICY "Public can read milestones"
  ON public.milestones
  FOR SELECT
  TO public
  USING (true);

-- player_milestones policies
CREATE POLICY "Users read own player_milestones"
  ON public.player_milestones
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "System manage player_milestones"
  ON public.player_milestones
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- player_daily_progress policies
CREATE POLICY "Users read own daily_progress"
  ON public.player_daily_progress
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "System manage daily_progress"
  ON public.player_daily_progress
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- player_login_streaks policies
CREATE POLICY "Users read own login_streaks"
  ON public.player_login_streaks
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "System manage login_streaks"
  ON public.player_login_streaks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Notes:
-- 1. Write access restricted to service_role for system-controlled updates.
-- 2. If admin UI needs direct writes via auth users, add an additional policy with role check.
-- 3. Public (anon) can read milestone catalog for unauthenticated onboarding visibility.
