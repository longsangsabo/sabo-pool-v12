-- Fix tournaments table schema by adding end_date column that mirrors tournament_end
-- This resolves "Could not find the 'end_date' column of 'tournaments' in the schema cache"

-- Step 1: Check and add end_date column if needed
DO $$
BEGIN
  -- Add end_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'end_date'
  ) THEN
    -- Add end_date column that mirrors tournament_end
    ALTER TABLE tournaments ADD COLUMN end_date TIMESTAMPTZ;
    
    -- Update existing records to set end_date = tournament_end
    UPDATE tournaments SET end_date = tournament_end;
    
    -- Add comments to explain the dual columns
    COMMENT ON COLUMN tournaments.end_date IS 'Alias for tournament_end - added for compatibility with v12 API';
    COMMENT ON COLUMN tournaments.tournament_end IS 'End date and time of the tournament - synced with end_date';
  END IF;
END
$$;

-- Step 2: Create function separately, outside the DO block
CREATE OR REPLACE FUNCTION sync_tournament_end_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT operations
  IF TG_OP = 'INSERT' THEN
    IF NEW.end_date IS NOT NULL AND NEW.tournament_end IS NULL THEN
      NEW.tournament_end = NEW.end_date;
    ELSIF NEW.tournament_end IS NOT NULL AND NEW.end_date IS NULL THEN
      NEW.end_date = NEW.tournament_end;
    END IF;
  -- For UPDATE operations
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.end_date IS DISTINCT FROM OLD.end_date THEN
      NEW.tournament_end = NEW.end_date;
    END IF;
    
    IF NEW.tournament_end IS DISTINCT FROM OLD.tournament_end THEN
      NEW.end_date = NEW.tournament_end;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop existing trigger if any and create new one
DROP TRIGGER IF EXISTS sync_tournament_dates ON tournaments;
CREATE TRIGGER sync_tournament_dates
  BEFORE INSERT OR UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION sync_tournament_end_dates();
