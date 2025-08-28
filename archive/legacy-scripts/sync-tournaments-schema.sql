-- Comprehensive schema alignment script for tournaments table
-- This script synchronizes the database schema with the frontend model
-- It adds any missing columns needed by the frontend application

-- Create functions outside DO block to avoid syntax errors
-- Function to sync end_date and tournament_end
CREATE OR REPLACE FUNCTION sync_tournament_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- If end_date is updated, update tournament_end
    IF NEW.end_date IS DISTINCT FROM OLD.end_date THEN
      NEW.tournament_end := NEW.end_date;
    -- If tournament_end is updated, update end_date  
    ELSIF NEW.tournament_end IS DISTINCT FROM OLD.tournament_end THEN
      NEW.end_date := NEW.tournament_end;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync start_date and tournament_start
CREATE OR REPLACE FUNCTION sync_start_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- If start_date is updated, update tournament_start
    IF NEW.start_date IS DISTINCT FROM OLD.start_date THEN
      NEW.tournament_start := NEW.start_date;
    -- If tournament_start is updated, update start_date  
    ELSIF NEW.tournament_start IS DISTINCT FROM OLD.tournament_start THEN
      NEW.start_date := NEW.tournament_start;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  column_exists boolean;
BEGIN
  RAISE NOTICE 'Starting comprehensive schema alignment for tournaments table...';
  
  -- First verify if tournaments table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'tournaments'
  ) THEN
    RAISE EXCEPTION 'Table tournaments does not exist! Please run the recreate-tournaments-table.sql script first.';
  END IF;

  -- Check and add end_date column (synced with tournament_end)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'end_date'
  ) THEN
    -- Check if tournament_end exists to sync with
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'tournament_end'
    ) THEN
      -- Add end_date as an alias to tournament_end
      ALTER TABLE tournaments ADD COLUMN end_date TIMESTAMPTZ;
      
      -- Set initial values from tournament_end
      UPDATE tournaments SET end_date = tournament_end WHERE tournament_end IS NOT NULL;
      
      -- Create trigger to keep them in sync
      DROP TRIGGER IF EXISTS sync_tournament_dates ON tournaments;
      CREATE TRIGGER sync_tournament_dates
      BEFORE UPDATE ON tournaments
      FOR EACH ROW
      EXECUTE FUNCTION sync_tournament_dates();
      
      RAISE NOTICE 'Added end_date column synced with tournament_end';
    ELSE
      -- If tournament_end doesn't exist, just add end_date
      ALTER TABLE tournaments ADD COLUMN end_date TIMESTAMPTZ;
      RAISE NOTICE 'Added end_date column (tournament_end not found)';
    END IF;
    
    COMMENT ON COLUMN tournaments.end_date IS 'End date and time of the tournament';
  END IF;

  -- Check and add game_format column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'game_format'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN game_format TEXT NOT NULL DEFAULT '8-ball';
    
    -- Add constraint for valid game formats
    ALTER TABLE tournaments 
    ADD CONSTRAINT tournaments_game_format_check 
    CHECK (game_format IN ('8-ball', '9-ball', '10-ball', 'straight-pool', 'one-pocket', 'bank-pool', 'rotation', 'custom'));
    
    COMMENT ON COLUMN tournaments.game_format IS 'Game format/variant being played (e.g., 8-ball, 9-ball, 10-ball)';
    RAISE NOTICE 'Added game_format column with constraint';
  END IF;

  -- Check and add is_public column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT TRUE;
    
    -- Create index for filtering by visibility
    CREATE INDEX idx_tournaments_is_public ON tournaments(is_public);
    
    COMMENT ON COLUMN tournaments.is_public IS 'Indicates whether the tournament is public (visible to all users) or private (visible only to specific users)';
    RAISE NOTICE 'Added is_public column with index';
  END IF;

  -- Check and add requires_approval column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'requires_approval'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN requires_approval BOOLEAN NOT NULL DEFAULT FALSE;
    
    -- Create index for filtering by approval requirement
    CREATE INDEX idx_tournaments_requires_approval ON tournaments(requires_approval);
    
    COMMENT ON COLUMN tournaments.requires_approval IS 'Indicates whether player registrations require admin approval before being confirmed';
    RAISE NOTICE 'Added requires_approval column with index';
  END IF;
  
  -- Check and add tier_level column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'tier_level'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN tier_level INTEGER;
    
    -- Add comment to explain the column
    COMMENT ON COLUMN tournaments.tier_level IS 'Tournament tier level (1-6) corresponding to tournament importance and prize pool';
    RAISE NOTICE 'Added tier_level column';
  END IF;
  
  -- Check and add tier column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'tier'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN tier TEXT;
    
    -- Add comment to explain the column
    COMMENT ON COLUMN tournaments.tier IS 'Tournament tier code (E, F, G, H, I, K) corresponding to tournament level';
    RAISE NOTICE 'Added tier column';
  END IF;
  
  -- Check and add first_prize, second_prize, third_prize columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'first_prize'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN first_prize DECIMAL(12,2) DEFAULT 0.00;
    COMMENT ON COLUMN tournaments.first_prize IS 'Prize money for first place';
    RAISE NOTICE 'Added first_prize column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'second_prize'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN second_prize DECIMAL(12,2) DEFAULT 0.00;
    COMMENT ON COLUMN tournaments.second_prize IS 'Prize money for second place';
    RAISE NOTICE 'Added second_prize column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'third_prize'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN third_prize DECIMAL(12,2) DEFAULT 0.00;
    COMMENT ON COLUMN tournaments.third_prize IS 'Prize money for third place';
    RAISE NOTICE 'Added third_prize column';
  END IF;
  
  -- Check and add venue_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'venue_address'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN venue_address TEXT;
    COMMENT ON COLUMN tournaments.venue_address IS 'Address of the tournament venue if different from club address';
    RAISE NOTICE 'Added venue_address column';
  END IF;
  
  -- Check and add banner_image column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'banner_image'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN banner_image TEXT;
    COMMENT ON COLUMN tournaments.banner_image IS 'URL of tournament banner image';
    RAISE NOTICE 'Added banner_image column';
  END IF;
  
  -- Check and add contact_info column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'contact_info'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN contact_info JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN tournaments.contact_info IS 'Contact information for tournament organizers';
    RAISE NOTICE 'Added contact_info column';
  END IF;
  
  -- Check and add spa_points_config and elo_points_config columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'spa_points_config'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN spa_points_config JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN tournaments.spa_points_config IS 'Configuration for SPA points distribution';
    RAISE NOTICE 'Added spa_points_config column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'elo_points_config'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN elo_points_config JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN tournaments.elo_points_config IS 'Configuration for ELO points distribution';
    RAISE NOTICE 'Added elo_points_config column';
  END IF;
  
  -- Check and add physical_prizes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'physical_prizes'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN physical_prizes JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN tournaments.physical_prizes IS 'Information about physical prizes';
    RAISE NOTICE 'Added physical_prizes column';
  END IF;
  
  -- Check and add rank_requirement columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'min_rank_requirement'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN min_rank_requirement TEXT;
    COMMENT ON COLUMN tournaments.min_rank_requirement IS 'Minimum rank required to participate';
    RAISE NOTICE 'Added min_rank_requirement column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'max_rank_requirement'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN max_rank_requirement TEXT;
    COMMENT ON COLUMN tournaments.max_rank_requirement IS 'Maximum rank allowed to participate';
    RAISE NOTICE 'Added max_rank_requirement column';
  END IF;
  
  -- Check column naming alignment between frontend and backend
  -- start_date vs tournament_start
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'tournament_start'
  ) INTO column_exists;
  
  IF column_exists AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'start_date'
  ) THEN
    -- Add start_date synced with tournament_start
    ALTER TABLE tournaments ADD COLUMN start_date TIMESTAMPTZ;
    
    -- Set initial values from tournament_start
    UPDATE tournaments SET start_date = tournament_start WHERE tournament_start IS NOT NULL;
    
    -- Create trigger to keep them in sync
    DROP TRIGGER IF EXISTS sync_start_dates ON tournaments;
    CREATE TRIGGER sync_start_dates
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION sync_start_dates();
    
    COMMENT ON COLUMN tournaments.start_date IS 'Start date and time of the tournament';
    RAISE NOTICE 'Added start_date column synced with tournament_start';
  END IF;

  -- Add additional indexes for performance if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'tournaments' AND indexname = 'idx_tournaments_type_status'
  ) THEN
    CREATE INDEX idx_tournaments_type_status ON tournaments(tournament_type, status);
    RAISE NOTICE 'Added combined index on tournament_type and status';
  END IF;

  RAISE NOTICE 'Schema alignment completed for tournaments table';
END
$$;

-- Verify the table structure after alignment
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' AND 
  table_name = 'tournaments' 
ORDER BY 
  ordinal_position;
