-- Recreate tournaments table with proper schema
-- This table was lost during migration consolidation

CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tournament_type TEXT NOT NULL DEFAULT 'sabo_double_elimination' CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'sabo_double_elimination')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration', 'in_progress', 'completed', 'cancelled')),
  
  -- Date and time fields
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  
  -- Tournament configuration
  max_participants INTEGER DEFAULT 32,
  current_participants INTEGER DEFAULT 0,
  entry_fee DECIMAL(10,2) DEFAULT 0.00,
  prize_pool DECIMAL(12,2) DEFAULT 0.00,
  
  -- SABO tournament specific
  is_sabo_tournament BOOLEAN DEFAULT false,
  sabo_tier_id UUID REFERENCES tournament_tiers(id),
  race_to INTEGER DEFAULT 7,
  
  -- Location and organization
  club_id UUID REFERENCES clubs(id),
  organizer_id UUID REFERENCES auth.users(id),
  
  -- Tournament rules and settings
  rules JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_club_id ON tournaments(club_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_tournament_type ON tournaments(tournament_type);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tournaments" ON tournaments
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = organizer_id OR auth.uid() = created_by);

CREATE POLICY "Tournament organizers can update their tournaments" ON tournaments
  FOR UPDATE TO authenticated
  USING (auth.uid() = organizer_id OR auth.uid() = created_by);

CREATE POLICY "Tournament organizers can delete their tournaments" ON tournaments
  FOR DELETE TO authenticated
  USING (auth.uid() = organizer_id OR auth.uid() = created_by);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_tournaments_updated_at();

-- Add some sample data if table is empty
INSERT INTO tournaments (
  name,
  description,
  tournament_type,
  status,
  start_date,
  end_date,
  max_participants,
  is_sabo_tournament,
  race_to
) VALUES 
(
  'SABO Winter Championship 2025',
  'Giải đấu Pool SABO mùa đông 2025 - Double Elimination Format',
  'sabo_double_elimination',
  'upcoming',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '14 days',
  32,
  true,
  7
),
(
  'Weekend Pool Tournament',
  'Giải đấu cuối tuần dành cho tất cả skill level',
  'double_elimination',
  'registration',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '5 days',
  16,
  false,
  5
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE tournaments IS 'Main tournaments table for organizing pool tournaments';
COMMENT ON COLUMN tournaments.tournament_type IS 'Type of tournament: single_elimination, double_elimination, round_robin, sabo_double_elimination';
COMMENT ON COLUMN tournaments.is_sabo_tournament IS 'Whether this is an official SABO tournament with special rules';
COMMENT ON COLUMN tournaments.race_to IS 'Number of games to win in SABO format (default 7)';
