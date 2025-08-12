-- Fix tournament_start constraint in tournaments table
-- This script modifies the tournament_start column to either allow NULL or set a default value

-- First, create the function outside of DO block
CREATE OR REPLACE FUNCTION sync_tournament_dates_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tournament_start IS NULL AND NEW.start_date IS NOT NULL THEN
    NEW.tournament_start := NEW.start_date;
  ELSIF NEW.start_date IS NULL AND NEW.tournament_start IS NOT NULL THEN
    NEW.start_date := NEW.tournament_start;
  ELSIF NEW.start_date IS NULL AND NEW.tournament_start IS NULL THEN
    NEW.start_date := NOW();
    NEW.tournament_start := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Now execute the main changes in DO block
DO $$
BEGIN
  -- Check if tournament_start is a NOT NULL column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'tournament_start'
    AND is_nullable = 'NO'
  ) THEN
    -- Option 1: Change to allow NULL
    -- ALTER TABLE tournaments ALTER COLUMN tournament_start DROP NOT NULL;
    
    -- Option 2 (better): Set default value to current timestamp
    ALTER TABLE tournaments ALTER COLUMN tournament_start SET DEFAULT NOW();
    
    -- Also make start_date have the same default if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tournaments' 
      AND column_name = 'start_date'
    ) THEN
      ALTER TABLE tournaments ALTER COLUMN start_date SET DEFAULT NOW();
    END IF;
    
    RAISE NOTICE 'Modified tournament_start to have default value NOW()';
  ELSE
    RAISE NOTICE 'tournament_start already allows NULL or has a default value';
  END IF;
  
  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS sync_tournament_dates_on_insert ON tournaments;
  
  -- Create the trigger
  CREATE TRIGGER sync_tournament_dates_on_insert
  BEFORE INSERT ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION sync_tournament_dates_on_insert();
  
  RAISE NOTICE 'Created trigger to synchronize tournament_start and start_date on INSERT';
END
$$;

-- Verify the column constraints after changes
SELECT 
  column_name, 
  is_nullable, 
  column_default 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' AND 
  table_name = 'tournaments' AND
  column_name IN ('tournament_start', 'start_date')
ORDER BY 
  column_name;
