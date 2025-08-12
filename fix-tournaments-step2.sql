-- Step 2: Add constraints and indexes (only if they don't exist)
DO $$
BEGIN
  -- Add tournament_type check if not exists
  BEGIN
    ALTER TABLE tournaments ADD CONSTRAINT tournaments_tournament_type_check 
      CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'sabo_double_elimination'));
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint tournaments_tournament_type_check already exists';
  END;
  
  -- Add status check if not exists
  BEGIN
    ALTER TABLE tournaments ADD CONSTRAINT tournaments_status_check 
      CHECK (status IN ('upcoming', 'registration', 'in_progress', 'completed', 'cancelled'));
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Constraint tournaments_status_check already exists';
  END;
END$$;

-- Indexes are safe with IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_tournament_type ON tournaments(tournament_type);
