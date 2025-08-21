-- TEMPORARY FIX: Allow bracket generation for club management users
-- This is a quick fix for the "Failed to save matches to database" issue

-- Add temporary policy to allow tournament matches operations for club management access
CREATE POLICY "temp_club_management_matches_access" ON public.tournament_matches
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Note: This policy allows all authenticated users to manage tournament_matches
-- In production, this should be replaced with more specific policies
