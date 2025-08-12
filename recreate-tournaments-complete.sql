-- Complete Recreation of tournaments table with proper schema
-- This script drops the old table and creates a new one with correct schema from scratch

-- Step 1: Backup existing data (if any)
DO $$
BEGIN
  -- Create backup table if tournaments has data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments' AND table_schema = 'public') THEN
    IF EXISTS (SELECT 1 FROM tournaments LIMIT 1) THEN
      DROP TABLE IF EXISTS tournaments_backup;
      CREATE TABLE tournaments_backup AS SELECT * FROM tournaments;
      RAISE NOTICE 'Backed up existing tournament data to tournaments_backup';
    ELSE
      RAISE NOTICE 'No existing tournament data to backup';
    END IF;
  END IF;
END
$$;

-- Step 2: Drop existing table and all related objects
DROP TABLE IF EXISTS tournaments CASCADE;

-- Step 3: Create new tournaments table with complete and correct schema
CREATE TABLE tournaments (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic tournament info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Tournament configuration
  tournament_type TEXT NOT NULL DEFAULT 'single_elimination' 
    CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss', 'sabo_double_elimination')),
  game_format TEXT NOT NULL DEFAULT '8_ball' 
    CHECK (game_format IN ('8_ball', '9_ball', '10_ball', 'straight_pool', 'one_pocket', 'bank_pool', 'rotation', 'custom')),
  
  -- Status and visibility
  status TEXT NOT NULL DEFAULT 'registration_open' 
    CHECK (status IN ('registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled')),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Participant management
  max_participants INTEGER DEFAULT 32,
  current_participants INTEGER DEFAULT 0,
  
  -- Financial info
  entry_fee NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  first_prize NUMERIC DEFAULT 0.00,
  second_prize NUMERIC DEFAULT 0.00,
  third_prize NUMERIC DEFAULT 0.00,
  
  -- Date and time fields (with proper defaults)
  tournament_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tournament_end TIMESTAMPTZ,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  registration_start TIMESTAMPTZ DEFAULT NOW(),
  registration_end TIMESTAMPTZ,
  
  -- Location info
  club_id UUID REFERENCES clubs(id),
  venue_address TEXT,
  location TEXT,
  
  -- Tournament management
  organizer_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  
  -- Tournament tier and ranking
  tier TEXT CHECK (tier IN ('E', 'F', 'G', 'H', 'I', 'K')),
  tier_level INTEGER,
  
  -- Rules and configuration
  rules TEXT,
  contact_info JSONB DEFAULT '{}'::jsonb,
  spa_points_config JSONB DEFAULT '{}'::jsonb,
  elo_points_config JSONB DEFAULT '{}'::jsonb,
  physical_prizes JSONB DEFAULT '{}'::jsonb,
  
  -- Rank requirements
  min_rank_requirement TEXT,
  max_rank_requirement TEXT,
  
  -- Media
  banner_image TEXT,
  
  -- Legacy compatibility fields
  format TEXT DEFAULT 'single_elimination',
  bracket_type TEXT DEFAULT 'single_elimination',
  bracket_generated BOOLEAN DEFAULT FALSE,
  is_demo BOOLEAN DEFAULT FALSE,
  winner_id UUID,
  runner_up_id UUID,
  third_place_id UUID,
  round_robin_rounds INTEGER,
  advancement_rule TEXT DEFAULT 'elimination',
  tiebreaker_rule TEXT DEFAULT 'head_to_head',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(tournament_start);
CREATE INDEX idx_tournaments_club_id ON tournaments(club_id);
CREATE INDEX idx_tournaments_organizer_id ON tournaments(organizer_id);
CREATE INDEX idx_tournaments_created_by ON tournaments(created_by);
CREATE INDEX idx_tournaments_type_status ON tournaments(tournament_type, status);
CREATE INDEX idx_tournaments_is_public ON tournaments(is_public);
CREATE INDEX idx_tournaments_is_visible ON tournaments(is_visible);
CREATE INDEX idx_tournaments_requires_approval ON tournaments(requires_approval);
CREATE INDEX idx_tournaments_tier ON tournaments(tier);
CREATE INDEX idx_tournaments_deleted_at ON tournaments(deleted_at) WHERE deleted_at IS NOT NULL;

-- Step 5: Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Sync date fields
  IF NEW.tournament_start IS DISTINCT FROM OLD.tournament_start THEN
    NEW.start_date := NEW.tournament_start;
  ELSIF NEW.start_date IS DISTINCT FROM OLD.start_date THEN
    NEW.tournament_start := NEW.start_date;
  END IF;
  
  IF NEW.tournament_end IS DISTINCT FROM OLD.tournament_end THEN
    NEW.end_date := NEW.tournament_end;
  ELSIF NEW.end_date IS DISTINCT FROM OLD.end_date THEN
    NEW.tournament_end := NEW.end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_tournaments_updated_at();

-- Trigger for INSERT to sync dates and set defaults
CREATE OR REPLACE FUNCTION set_tournament_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync organizer_id with created_by if not set
  IF NEW.organizer_id IS NULL AND NEW.created_by IS NOT NULL THEN
    NEW.organizer_id := NEW.created_by;
  ELSIF NEW.created_by IS NULL AND NEW.organizer_id IS NOT NULL THEN
    NEW.created_by := NEW.organizer_id;
  END IF;
  
  -- Sync start dates
  IF NEW.start_date IS NULL AND NEW.tournament_start IS NOT NULL THEN
    NEW.start_date := NEW.tournament_start;
  ELSIF NEW.tournament_start IS NULL AND NEW.start_date IS NOT NULL THEN
    NEW.tournament_start := NEW.start_date;
  END IF;
  
  -- Sync end dates
  IF NEW.end_date IS NULL AND NEW.tournament_end IS NOT NULL THEN
    NEW.end_date := NEW.tournament_end;
  ELSIF NEW.tournament_end IS NULL AND NEW.end_date IS NOT NULL THEN
    NEW.tournament_end := NEW.end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tournament_defaults
  BEFORE INSERT ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION set_tournament_defaults();

-- Step 6: Enable RLS and create proper policies
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing tournaments
CREATE POLICY "tournaments_select_policy" ON tournaments FOR SELECT
USING (
  (is_public = TRUE AND is_visible = TRUE AND deleted_at IS NULL) 
  OR auth.uid() = created_by 
  OR auth.uid() = organizer_id
);

-- Policy for creating tournaments
CREATE POLICY "tournaments_insert_policy" ON tournaments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating tournaments
CREATE POLICY "tournaments_update_policy" ON tournaments FOR UPDATE
TO authenticated
USING (auth.uid() = organizer_id OR auth.uid() = created_by);

-- Policy for deleting tournaments (soft delete by setting deleted_at)
CREATE POLICY "tournaments_delete_policy" ON tournaments FOR DELETE
TO authenticated
USING (auth.uid() = organizer_id OR auth.uid() = created_by);

-- Step 7: Add comments for documentation
COMMENT ON TABLE tournaments IS 'Main tournaments table for pool tournament management';
COMMENT ON COLUMN tournaments.tournament_type IS 'Type of tournament structure (single_elimination, double_elimination, etc.)';
COMMENT ON COLUMN tournaments.game_format IS 'Pool game variant (8_ball, 9_ball, etc.)';
COMMENT ON COLUMN tournaments.is_public IS 'Whether tournament is visible to all users';
COMMENT ON COLUMN tournaments.requires_approval IS 'Whether registrations require admin approval';
COMMENT ON COLUMN tournaments.organizer_id IS 'User who organizes the tournament';
COMMENT ON COLUMN tournaments.tier IS 'Tournament tier (E=highest, K=lowest)';
COMMENT ON COLUMN tournaments.tier_level IS 'Numeric tier level (1-6)';

-- Step 8: Insert sample data for testing
INSERT INTO tournaments (
  name,
  description,
  tournament_type,
  game_format,
  status,
  max_participants,
  tournament_start,
  tournament_end,
  is_public,
  requires_approval,
  tier,
  tier_level
) VALUES 
(
  'SABO Winter Championship 2025',
  'Giải đấu Pool SABO mùa đông 2025 - Double Elimination Format',
  'double_elimination',
  '8_ball',
  'registration_open',
  32,
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '14 days',
  TRUE,
  FALSE,
  'H',
  3
),
(
  'Weekend Pool Tournament',
  'Giải đấu cuối tuần dành cho tất cả skill level',
  'single_elimination',
  '9_ball',
  'registration_open',
  16,
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '5 days',
  TRUE,
  FALSE,
  'I',
  2
) ON CONFLICT DO NOTHING;

-- Step 9: Verify the new table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'tournaments'
ORDER BY ordinal_position;

-- Script completed successfully
