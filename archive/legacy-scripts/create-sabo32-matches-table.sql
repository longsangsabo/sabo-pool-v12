-- =============================================
-- CREATE SEPARATE TABLE FOR SABO-32 MATCHES
-- Avoid conflicts with existing tournament_matches
-- =============================================

-- Create dedicated table for SABO-32 tournament matches
CREATE TABLE IF NOT EXISTS sabo32_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    
    -- SABO-32 specific fields
    group_id VARCHAR(1) CHECK (group_id IN ('A', 'B') OR group_id IS NULL), -- NULL for cross-bracket
    bracket_type VARCHAR(50) NOT NULL,
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    sabo_match_id VARCHAR(20) NOT NULL, -- e.g., 'A-W1', 'B-LA2', 'SF1', 'FINAL'
    
    -- Players and results
    player1_id UUID REFERENCES auth.users(id),
    player2_id UUID REFERENCES auth.users(id),
    winner_id UUID REFERENCES auth.users(id),
    
    -- Scores
    score_player1 INTEGER DEFAULT 0,
    score_player2 INTEGER DEFAULT 0,
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'bye')),
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tournament_id, sabo_match_id),
    CHECK (player1_id != player2_id OR player2_id IS NULL),
    CHECK (winner_id IS NULL OR winner_id IN (player1_id, player2_id))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sabo32_matches_tournament_id ON sabo32_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sabo32_matches_group_bracket ON sabo32_matches(tournament_id, group_id, bracket_type);
CREATE INDEX IF NOT EXISTS idx_sabo32_matches_round ON sabo32_matches(tournament_id, round_number);
CREATE INDEX IF NOT EXISTS idx_sabo32_matches_status ON sabo32_matches(status);
CREATE INDEX IF NOT EXISTS idx_sabo32_matches_players ON sabo32_matches(player1_id, player2_id);

-- Enable RLS (but with permissive policies)
ALTER TABLE sabo32_matches ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies
CREATE POLICY "Anyone can view SABO-32 matches"
ON sabo32_matches
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert SABO-32 matches"
ON sabo32_matches
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update SABO-32 matches"
ON sabo32_matches
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON sabo32_matches TO authenticated;
GRANT ALL ON sabo32_matches TO anon;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_sabo32_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sabo32_matches_updated_at
    BEFORE UPDATE ON sabo32_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_sabo32_matches_updated_at();

-- Verify table creation
SELECT 'sabo32_matches table created successfully' as status;

-- Show table structure using SQL standard query
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sabo32_matches' 
ORDER BY ordinal_position;
