-- ===================================================================
-- 🔧 STEP 8: CREATE SABO FUNCTIONS - Paste vào Supabase Dashboard
-- Tạo các SABO functions tương thích với clean schema
-- ===================================================================

-- Helper function: Updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER tournaments_updated_at 
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER tournament_matches_updated_at 
  BEFORE UPDATE ON tournament_matches
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER tournament_results_updated_at 
  BEFORE UPDATE ON tournament_results
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER tournament_registrations_updated_at 
  BEFORE UPDATE ON tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Drop existing function first (if exists)
DROP FUNCTION IF EXISTS assign_participant_to_next_match(UUID, INTEGER, UUID) CASCADE;

-- Helper function để assign participants to matches
CREATE OR REPLACE FUNCTION assign_participant_to_next_match(
  p_tournament_id UUID,
  p_round_number INTEGER,
  p_participant_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id UUID;
BEGIN
  -- Find the next available match in the round
  SELECT id INTO v_match_id
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id
    AND round_number = p_round_number
    AND (player1_id IS NULL OR player2_id IS NULL)
    AND status = 'pending'
  ORDER BY match_number
  LIMIT 1;
  
  IF v_match_id IS NOT NULL THEN
    -- Assign to empty slot
    UPDATE tournament_matches
    SET 
      player1_id = CASE WHEN player1_id IS NULL THEN p_participant_id ELSE player1_id END,
      player2_id = CASE WHEN player1_id IS NOT NULL AND player2_id IS NULL THEN p_participant_id ELSE player2_id END,
      status = CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'ready' ELSE 'pending' END,
      updated_at = NOW()
    WHERE id = v_match_id;
  END IF;
END;
$$;

-- Drop existing functions first (if exist)
DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;
DROP FUNCTION IF EXISTS is_current_user_club_owner(UUID) CASCADE;

-- Helper functions for admin/club owner checks
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false; -- If profiles table doesn't exist, assume not admin
END;
$$;

CREATE OR REPLACE FUNCTION is_current_user_club_owner(p_club_id UUID)
RETURNS boolean  
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM club_profiles 
    WHERE id = p_club_id AND user_id = auth.uid()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false; -- If club_profiles table doesn't exist, assume not owner
END;
$$;

SELECT '✅ Helper functions and triggers created successfully' as status;
