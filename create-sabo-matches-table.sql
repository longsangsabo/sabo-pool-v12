-- SABO DOUBLE ELIMINATION MATCHES TABLE
-- Designed specifically for SABO tournament structure
-- Supports: Winner Bracket, Loser Branch A, Loser Branch B, Finals

CREATE TABLE sabo_tournament_matches (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- SABO-specific bracket organization
  bracket_type VARCHAR(20) NOT NULL CHECK (bracket_type IN ('winner', 'loser', 'finals')),
  branch_type VARCHAR(10) CHECK (branch_type IN ('A', 'B', NULL)), -- For loser bracket only
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  
  -- SABO match positioning (unique identifier within tournament)
  sabo_match_id VARCHAR(20) NOT NULL, -- e.g., 'WR1M1', 'LAR101M1', 'LBR201M1', 'FR401M1'
  
  -- Players and results
  player1_id UUID REFERENCES profiles(user_id),
  player2_id UUID REFERENCES profiles(user_id),
  player1_name VARCHAR(100), -- Cached for performance
  player2_name VARCHAR(100), -- Cached for performance
  
  -- Match outcome
  winner_id UUID REFERENCES profiles(user_id),
  loser_id UUID REFERENCES profiles(user_id),
  
  -- Scores
  score_player1 INTEGER DEFAULT 0,
  score_player2 INTEGER DEFAULT 0,
  
  -- Match status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'bye')),
  
  -- SABO-specific match flow
  advances_to_match_id VARCHAR(20), -- Which match winner advances to
  feeds_loser_to_match_id VARCHAR(20), -- Which match loser goes to (winner bracket only)
  
  -- Timing
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Table assignment
  assigned_table_id UUID,
  table_released_at TIMESTAMPTZ,
  
  -- Metadata
  is_bye_match BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tournament_id, sabo_match_id),
  UNIQUE(tournament_id, bracket_type, round_number, match_number)
);

-- Indexes for performance
CREATE INDEX idx_sabo_matches_tournament ON sabo_tournament_matches(tournament_id);
CREATE INDEX idx_sabo_matches_bracket ON sabo_tournament_matches(tournament_id, bracket_type, round_number);
CREATE INDEX idx_sabo_matches_status ON sabo_tournament_matches(status);
CREATE INDEX idx_sabo_matches_players ON sabo_tournament_matches(player1_id, player2_id);

-- RLS Policies
ALTER TABLE sabo_tournament_matches ENABLE ROW LEVEL SECURITY;

-- Policy for reading matches (all authenticated users can view)
CREATE POLICY "Users can view sabo tournament matches" ON sabo_tournament_matches
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for tournament organizers to manage matches
CREATE POLICY "Tournament organizers can manage sabo matches" ON sabo_tournament_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tournaments t 
            WHERE t.id = tournament_id 
            AND t.organizer_id = auth.uid()
        )
    );

-- Policy for admins (full access)
CREATE POLICY "Admins can manage all sabo matches" ON sabo_tournament_matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- Update trigger
CREATE OR REPLACE FUNCTION update_sabo_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sabo_matches_updated_at
    BEFORE UPDATE ON sabo_tournament_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_sabo_matches_updated_at();

-- Sample SABO match IDs for reference:
-- Winner Bracket: WR1M1, WR1M2, ..., WR1M8, WR2M1, ..., WR3M2
-- Loser Branch A: LAR101M1, LAR101M2, LAR101M3, LAR101M4, LAR102M1, LAR102M2, LAR103M1
-- Loser Branch B: LBR201M1, LBR201M2, LBR202M1
-- Finals: FR301M1, FR301M2, FR401M1
