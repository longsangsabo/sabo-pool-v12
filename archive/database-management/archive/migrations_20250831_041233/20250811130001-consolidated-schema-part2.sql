-- ===================================================================
-- 🔧 CONSOLIDATED SCHEMA MIGRATION - PART 2
-- Indexes, RLS Policies, Functions & Final Setup
-- ===================================================================

-- ===============================================
-- 📋 PHASE 4: PERFORMANCE INDEXES
-- ===============================================

-- Tournaments table indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_type_status ON tournaments(tournament_type, status);
CREATE INDEX IF NOT EXISTS idx_tournaments_club_id ON tournaments(club_id) WHERE club_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON tournaments(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(tournament_start);
CREATE INDEX IF NOT EXISTS idx_tournaments_visible ON tournaments(is_visible) WHERE is_visible = true;

-- Tournament_matches table indexes (CRITICAL for SABO performance)
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_round_bracket ON tournament_matches(tournament_id, round_number, bracket_type);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_players ON tournament_matches(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_winner ON tournament_matches(winner_id) WHERE winner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tournament_matches_status ON tournament_matches(status, tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_sabo_rounds ON tournament_matches(tournament_id, round_number) 
  WHERE round_number IN (1,2,3,101,102,103,201,202,250,300);

-- Tournament_results table indexes
CREATE INDEX IF NOT EXISTS idx_tournament_results_tournament ON tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_user ON tournament_results(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_position ON tournament_results(tournament_id, final_position);

-- Tournament_registrations table indexes
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_user ON tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status ON tournament_registrations(tournament_id, registration_status);

-- ===============================================
-- 📋 PHASE 5: ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;  
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- 🏆 TOURNAMENTS POLICIES
CREATE POLICY "admins_full_access_tournaments" ON tournaments
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "club_owners_manage_tournaments" ON tournaments  
  FOR ALL USING (
    created_by = auth.uid() OR
    club_id IN (
      SELECT cp.id FROM club_profiles cp WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "public_view_visible_tournaments" ON tournaments
  FOR SELECT USING (is_visible = true AND deleted_at IS NULL);

-- 🥅 TOURNAMENT_MATCHES POLICIES  
CREATE POLICY "admins_full_access_matches" ON tournament_matches
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "tournament_organizers_manage_matches" ON tournament_matches
  FOR ALL USING (
    tournament_id IN (
      SELECT t.id FROM tournaments t 
      WHERE t.created_by = auth.uid() OR 
            t.club_id IN (SELECT cp.id FROM club_profiles cp WHERE cp.user_id = auth.uid())
    )
  );

CREATE POLICY "participants_view_their_matches" ON tournament_matches
  FOR SELECT USING (
    auth.uid() IN (player1_id, player2_id) OR
    tournament_id IN (
      SELECT tr.tournament_id FROM tournament_registrations tr 
      WHERE tr.user_id = auth.uid() AND tr.registration_status = 'confirmed'
    )
  );

-- 🏅 TOURNAMENT_RESULTS POLICIES
CREATE POLICY "admins_full_access_results" ON tournament_results
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "tournament_organizers_manage_results" ON tournament_results
  FOR ALL USING (
    tournament_id IN (
      SELECT t.id FROM tournaments t 
      WHERE t.created_by = auth.uid() OR 
            t.club_id IN (SELECT cp.id FROM club_profiles cp WHERE cp.user_id = auth.uid())
    )
  );

CREATE POLICY "users_view_results" ON tournament_results
  FOR SELECT USING (true); -- Results are public

-- 📝 TOURNAMENT_REGISTRATIONS POLICIES
CREATE POLICY "admins_full_access_registrations" ON tournament_registrations
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "users_manage_own_registrations" ON tournament_registrations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "tournament_organizers_view_registrations" ON tournament_registrations
  FOR SELECT USING (
    tournament_id IN (
      SELECT t.id FROM tournaments t 
      WHERE t.created_by = auth.uid() OR 
            t.club_id IN (SELECT cp.id FROM club_profiles cp WHERE cp.user_id = auth.uid())
    )
  );

-- ===============================================
-- 📋 PHASE 6: UTILITY FUNCTIONS
-- ===============================================

-- Updated_at trigger function
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

-- ===============================================
-- 📋 PHASE 7: SABO COMPATIBILITY FUNCTIONS
-- ===============================================

-- Helper function to check if user is admin
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
END;
$$;

-- Helper function to check club ownership
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
END;
$$;

-- Function to get tournament bracket structure (for SABO)
CREATE OR REPLACE FUNCTION get_tournament_bracket_info(p_tournament_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tournament RECORD;
  v_bracket_info jsonb;
BEGIN
  SELECT * INTO v_tournament FROM tournaments WHERE id = p_tournament_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Tournament not found');
  END IF;
  
  SELECT jsonb_build_object(
    'tournament_id', v_tournament.id,
    'tournament_type', v_tournament.tournament_type,
    'format', v_tournament.format,
    'status', v_tournament.status,
    'max_participants', v_tournament.max_participants,
    'bracket_generated', v_tournament.bracket_generated,
    'total_matches', COUNT(tm.id),
    'completed_matches', COUNT(CASE WHEN tm.status = 'completed' THEN 1 END),
    'rounds_structure', jsonb_agg(
      DISTINCT jsonb_build_object(
        'round_number', tm.round_number,
        'bracket_type', tm.bracket_type,
        'match_count', COUNT(*) FILTER (WHERE tm.round_number IS NOT NULL)
      )
    ) FILTER (WHERE tm.round_number IS NOT NULL)
  ) INTO v_bracket_info
  FROM tournament_matches tm
  WHERE tm.tournament_id = p_tournament_id
  GROUP BY tm.round_number, tm.bracket_type;
  
  RETURN v_bracket_info;
END;
$$;

-- ===============================================
-- 📋 PHASE 8: DATA MIGRATION FROM BACKUPS
-- ===============================================

-- Migrate data back from backups if they exist
DO $$
DECLARE
  backup_table_name TEXT;
  migration_count INTEGER;
BEGIN
  -- Check for tournaments backup
  SELECT table_name INTO backup_table_name
  FROM information_schema.tables 
  WHERE table_name LIKE 'tournaments_backup_%'
  ORDER BY table_name DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    EXECUTE format('
      INSERT INTO tournaments 
      SELECT * FROM %I 
      ON CONFLICT (id) DO NOTHING', backup_table_name);
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    RAISE NOTICE '✅ Migrated % tournaments from %', migration_count, backup_table_name;
  END IF;
  
  -- Check for tournament_matches backup
  SELECT table_name INTO backup_table_name
  FROM information_schema.tables 
  WHERE table_name LIKE 'tournament_matches_backup_%'
  ORDER BY table_name DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    EXECUTE format('
      INSERT INTO tournament_matches 
      SELECT * FROM %I 
      ON CONFLICT (id) DO NOTHING', backup_table_name);
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    RAISE NOTICE '✅ Migrated % tournament_matches from %', migration_count, backup_table_name;
  END IF;
  
  -- Check for tournament_results backup
  SELECT table_name INTO backup_table_name
  FROM information_schema.tables 
  WHERE table_name LIKE 'tournament_results_backup_%'
  ORDER BY table_name DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    EXECUTE format('
      INSERT INTO tournament_results 
      SELECT * FROM %I 
      ON CONFLICT (id) DO NOTHING', backup_table_name);
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    RAISE NOTICE '✅ Migrated % tournament_results from %', migration_count, backup_table_name;
  END IF;
END $$;

-- ===============================================
-- 📋 PHASE 9: VERIFICATION & LOGGING
-- ===============================================

-- Log consolidation completion
DO $$
DECLARE
  v_tournaments_count INTEGER;
  v_matches_count INTEGER;
  v_results_count INTEGER;
  v_registrations_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_tournaments_count FROM tournaments;
  SELECT COUNT(*) INTO v_matches_count FROM tournament_matches;
  SELECT COUNT(*) INTO v_results_count FROM tournament_results;
  SELECT COUNT(*) INTO v_registrations_count FROM tournament_registrations;
  
  RAISE NOTICE '🎯 SCHEMA CONSOLIDATION COMPLETED';
  RAISE NOTICE '📊 Data Summary:';
  RAISE NOTICE '   - Tournaments: %', v_tournaments_count;
  RAISE NOTICE '   - Matches: %', v_matches_count;  
  RAISE NOTICE '   - Results: %', v_results_count;
  RAISE NOTICE '   - Registrations: %', v_registrations_count;
  RAISE NOTICE '✅ All tables, indexes, policies, and functions created successfully';
END $$;

COMMIT;
