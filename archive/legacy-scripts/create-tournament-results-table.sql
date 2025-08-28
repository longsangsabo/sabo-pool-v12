-- ============================================
-- CREATE TOURNAMENT RESULTS TABLE
-- ============================================
-- Table to store final results and rankings for completed tournaments

-- Create tournament_results table
CREATE TABLE IF NOT EXISTS tournament_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Position and placement information
  final_position integer NOT NULL,
  placement_type text DEFAULT NULL, -- 'champion', 'runner_up', 'third_place', etc.
  
  -- Match statistics
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  matches_played integer DEFAULT 0,
  win_percentage decimal(5,2) DEFAULT 0.00,
  
  -- Points and rewards
  spa_points_earned integer DEFAULT 0,
  elo_points_awarded integer DEFAULT 0,
  elo_points_before integer DEFAULT 0,
  elo_points_after integer DEFAULT 0,
  
  -- Tournament progression tracking
  eliminated_in_round integer DEFAULT NULL,
  eliminated_by_user_id uuid DEFAULT NULL REFERENCES auth.users(id),
  last_match_id uuid DEFAULT NULL REFERENCES tournament_matches(id),
  
  -- Metadata
  calculated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraints
  UNIQUE(tournament_id, user_id),
  UNIQUE(tournament_id, final_position),
  CHECK (final_position > 0),
  CHECK (wins >= 0),
  CHECK (losses >= 0),
  CHECK (matches_played >= 0),
  CHECK (win_percentage >= 0 AND win_percentage <= 100),
  CHECK (spa_points_earned >= 0),
  CHECK (elo_points_before >= 0),
  CHECK (elo_points_after >= 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_results_tournament_id ON tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_user_id ON tournament_results(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_final_position ON tournament_results(tournament_id, final_position);
CREATE INDEX IF NOT EXISTS idx_tournament_results_calculated_at ON tournament_results(calculated_at);

-- Enable RLS (Row Level Security)
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to read all tournament results
CREATE POLICY "tournament_results_read_all" ON tournament_results
  FOR SELECT USING (true);

-- Allow users to read their own results
CREATE POLICY "tournament_results_read_own" ON tournament_results
  FOR SELECT USING (auth.uid() = user_id);

-- Only allow inserts/updates from service role or tournament management functions
CREATE POLICY "tournament_results_write_service" ON tournament_results
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM tournaments t
      WHERE t.id = tournament_id 
      AND t.club_id IN (
        SELECT club_id FROM club_members 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
      )
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_tournament_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tournament_results_updated_at_trigger
  BEFORE UPDATE ON tournament_results
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_results_updated_at();

-- Function to calculate tournament results
DROP FUNCTION IF EXISTS calculate_tournament_results(uuid);

CREATE OR REPLACE FUNCTION calculate_tournament_results(p_tournament_id uuid)
RETURNS json AS $$
DECLARE
  v_tournament record;
  v_participant record;
  v_match_stats record;
  v_final_position integer := 1;
  v_results_created integer := 0;
  v_champion_id uuid;
  v_runner_up_id uuid;
BEGIN
  -- Get tournament info
  SELECT * INTO v_tournament FROM tournaments WHERE id = p_tournament_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Tournament not found');
  END IF;
  
  -- Clear existing results
  DELETE FROM tournament_results WHERE tournament_id = p_tournament_id;
  
  -- Get all participants sorted by their performance
  FOR v_participant IN (
    WITH participant_stats AS (
      SELECT 
        tp.user_id,
        tp.status,
        COUNT(tm.id) as total_matches,
        COUNT(CASE WHEN tm.winner_id = tp.user_id THEN 1 END) as wins,
        COUNT(CASE WHEN tm.status = 'completed' AND tm.winner_id != tp.user_id THEN 1 END) as losses,
        CASE 
          WHEN COUNT(tm.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN tm.winner_id = tp.user_id THEN 1 END)::decimal / COUNT(tm.id)) * 100, 2)
          ELSE 0 
        END as win_percentage,
        -- Determine final position based on tournament progression
        CASE 
          -- For double elimination tournaments
          WHEN v_tournament.tournament_type IN ('double_elimination', 'sabo_double_elimination') THEN
            CASE
              -- Champion: won the grand final
              WHEN EXISTS (
                SELECT 1 FROM tournament_matches tm_final 
                WHERE tm_final.tournament_id = p_tournament_id 
                AND tm_final.round_number = 300 
                AND tm_final.winner_id = tp.user_id
              ) THEN 1
              -- Runner-up: lost the grand final
              WHEN EXISTS (
                SELECT 1 FROM tournament_matches tm_final 
                WHERE tm_final.tournament_id = p_tournament_id 
                AND tm_final.round_number = 300 
                AND (tm_final.player1_id = tp.user_id OR tm_final.player2_id = tp.user_id)
                AND tm_final.winner_id != tp.user_id
              ) THEN 2
              -- 3rd place: lost in semifinals
              WHEN EXISTS (
                SELECT 1 FROM tournament_matches tm_sf 
                WHERE tm_sf.tournament_id = p_tournament_id 
                AND tm_sf.round_number = 250
                AND (tm_sf.player1_id = tp.user_id OR tm_sf.player2_id = tp.user_id)
                AND tm_sf.winner_id != tp.user_id
              ) THEN 3
              -- Others: rank by wins then by earliest elimination
              ELSE 4 + ROW_NUMBER() OVER (
                ORDER BY COUNT(CASE WHEN tm.winner_id = tp.user_id THEN 1 END) DESC,
                         MIN(CASE WHEN tm.status = 'completed' AND tm.winner_id != tp.user_id THEN tm.round_number END) DESC
              )
            END
          -- For single elimination tournaments  
          WHEN v_tournament.tournament_type = 'single_elimination' THEN
            CASE
              -- Champion: won all matches and reached the end
              WHEN NOT EXISTS (
                SELECT 1 FROM tournament_matches tm_loss 
                WHERE tm_loss.tournament_id = p_tournament_id 
                AND (tm_loss.player1_id = tp.user_id OR tm_loss.player2_id = tp.user_id)
                AND tm_loss.winner_id != tp.user_id
                AND tm_loss.status = 'completed'
              ) THEN 1
              -- Others: rank by how far they progressed
              ELSE 1 + ROW_NUMBER() OVER (
                ORDER BY MAX(CASE WHEN tm.status = 'completed' AND tm.winner_id != tp.user_id THEN tm.round_number END) DESC NULLS LAST,
                         COUNT(CASE WHEN tm.winner_id = tp.user_id THEN 1 END) DESC
              )
            END
          -- Default ranking by wins
          ELSE ROW_NUMBER() OVER (
            ORDER BY COUNT(CASE WHEN tm.winner_id = tp.user_id THEN 1 END) DESC,
                     COUNT(tm.id) DESC
          )
        END as calculated_position
      FROM tournament_participants tp
      LEFT JOIN tournament_matches tm ON (
        tm.tournament_id = p_tournament_id AND 
        (tm.player1_id = tp.user_id OR tm.player2_id = tp.user_id)
      )
      WHERE tp.tournament_id = p_tournament_id
      GROUP BY tp.user_id, tp.status
    )
    SELECT * FROM participant_stats
    ORDER BY calculated_position, wins DESC, win_percentage DESC
  ) LOOP
    
    -- Insert tournament result
    INSERT INTO tournament_results (
      tournament_id,
      user_id,
      final_position,
      placement_type,
      wins,
      losses,
      matches_played,
      win_percentage,
      spa_points_earned,
      elo_points_awarded,
      calculated_at
    ) VALUES (
      p_tournament_id,
      v_participant.user_id,
      v_participant.calculated_position,
      CASE v_participant.calculated_position
        WHEN 1 THEN 'champion'
        WHEN 2 THEN 'runner_up'
        WHEN 3 THEN 'third_place'
        ELSE 'participant'
      END,
      v_participant.wins,
      v_participant.losses,
      v_participant.total_matches,
      v_participant.win_percentage,
      -- SPA Points calculation (can be customized)
      CASE v_participant.calculated_position
        WHEN 1 THEN 100
        WHEN 2 THEN 70
        WHEN 3 THEN 50
        WHEN 4 THEN 30
        ELSE GREATEST(10, 25 - v_participant.calculated_position)
      END,
      -- ELO Points calculation (simplified)
      CASE v_participant.calculated_position
        WHEN 1 THEN 50
        WHEN 2 THEN 30
        WHEN 3 THEN 20
        WHEN 4 THEN 10
        ELSE GREATEST(5, 15 - v_participant.calculated_position)
      END,
      now()
    );
    
    v_results_created := v_results_created + 1;
    
    -- Track champion and runner-up
    IF v_participant.calculated_position = 1 THEN
      v_champion_id := v_participant.user_id;
    ELSIF v_participant.calculated_position = 2 THEN  
      v_runner_up_id := v_participant.user_id;
    END IF;
    
  END LOOP;
  
  -- Return success result
  RETURN json_build_object(
    'success', true,
    'results_created', v_results_created,
    'champion_id', v_champion_id,
    'runner_up_id', v_runner_up_id,
    'tournament_id', p_tournament_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tournament_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tournament_results TO service_role;

-- ============================================
-- TOURNAMENT RESULTS TABLE READY
-- ============================================
-- ✅ Table created with all necessary fields
-- ✅ Indexes for performance
-- ✅ RLS policies for security  
-- ✅ Triggers for updated_at
-- ✅ Function to calculate results
-- ✅ Proper constraints and validations
--
-- Usage:
-- SELECT calculate_tournament_results('tournament-id');
-- ============================================
