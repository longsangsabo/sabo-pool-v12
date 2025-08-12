-- ===================================================================
-- 🥅 STEP 5: CREATE TOURNAMENT_MATCHES TABLE - Paste vào Supabase Dashboard
-- Core table cho SABO Double Elimination (27 matches)
-- ===================================================================

-- 🥅 CREATE TOURNAMENT_MATCHES TABLE (Core SABO Table)
CREATE TABLE tournament_matches (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- SABO bracket structure
  round_number INTEGER NOT NULL CHECK (round_number > 0),
  match_number INTEGER NOT NULL CHECK (match_number > 0),
  bracket_type TEXT NOT NULL DEFAULT 'winner'
    CHECK (bracket_type IN ('winners', 'losers', 'semifinals', 'finals', 'winner', 'loser')),
  branch_type TEXT CHECK (branch_type IN ('A', 'B')), -- Only for losers bracket
  
  -- Match participants
  player1_id UUID, -- References auth.users(id)
  player2_id UUID, -- References auth.users(id)
  winner_id UUID, -- References auth.users(id)
  
  -- Scoring system
  score_player1 INTEGER DEFAULT 0 CHECK (score_player1 >= 0),
  score_player2 INTEGER DEFAULT 0 CHECK (score_player2 >= 0),
  
  -- Match status & timing
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'ready', 'in_progress', 'completed', 'cancelled')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE, -- For legacy compatibility
  
  -- Table management
  assigned_table_id UUID, -- FK to tables (if table system exists)
  table_released_at TIMESTAMP WITH TIME ZONE,
  
  -- Score submission tracking
  score_status TEXT DEFAULT 'pending'
    CHECK (score_status IN ('pending', 'submitted', 'confirmed', 'disputed')),
  score_confirmed_by UUID, -- References auth.users(id)
  score_confirmed_at TIMESTAMP WITH TIME ZONE,
  score_input_by UUID, -- References auth.users(id) - Who submitted the score
  score_submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Special match flags  
  is_third_place_match BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tournament_id, round_number, match_number, bracket_type),
  
  -- Ensure winner is one of the players
  CHECK (winner_id IS NULL OR winner_id IN (player1_id, player2_id)),
  
  -- Ensure completed matches have winner
  CHECK (status != 'completed' OR winner_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;

-- Basic match policies
CREATE POLICY "public_view_matches" ON tournament_matches
  FOR SELECT USING (true); -- Everyone can view matches for now

-- Create SABO-optimized indexes
CREATE INDEX idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_tournament_matches_round_bracket ON tournament_matches(tournament_id, round_number, bracket_type);
CREATE INDEX idx_tournament_matches_sabo_rounds ON tournament_matches(tournament_id, round_number) 
  WHERE round_number IN (1,2,3,101,102,103,201,202,250,300);

SELECT '✅ TOURNAMENT_MATCHES table created with SABO indexes' as status;
