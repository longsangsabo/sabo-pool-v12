-- Fix tournaments table by adding is_public and requires_approval columns
-- This resolves "Could not find the 'is_public' column of 'tournaments' in the schema cache"
-- and adds requires_approval for tournament registration workflow

-- Step 1: Check and add is_public column if needed
DO $$
BEGIN
  -- Add is_public column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'is_public'
  ) THEN
    -- Add is_public column with default TRUE (most tournaments are public by default)
    ALTER TABLE tournaments ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT TRUE;
    
    -- Add comment to explain the column
    COMMENT ON COLUMN tournaments.is_public IS 'Indicates whether the tournament is public (visible to all users) or private (visible only to specific users)';
  END IF;
END
$$;

-- Step 2: Check and add requires_approval column if needed
DO $$
BEGIN
  -- Add requires_approval column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'requires_approval'
  ) THEN
    -- Add requires_approval column with default FALSE (most tournaments don't require approval by default)
    ALTER TABLE tournaments ADD COLUMN requires_approval BOOLEAN NOT NULL DEFAULT FALSE;
    
    -- Add comment to explain the column
    COMMENT ON COLUMN tournaments.requires_approval IS 'Indicates whether player registrations require admin approval before being confirmed';
  END IF;
END
$$;

-- Optional: Create indexes to improve filtering performance
DO $$
BEGIN
  -- Add is_public index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'tournaments' 
    AND indexname = 'idx_tournaments_is_public'
  ) THEN
    CREATE INDEX idx_tournaments_is_public ON tournaments(is_public);
  END IF;
  
  -- Add requires_approval index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'tournaments' 
    AND indexname = 'idx_tournaments_requires_approval'
  ) THEN
    CREATE INDEX idx_tournaments_requires_approval ON tournaments(requires_approval);
  END IF;
END
$$;
