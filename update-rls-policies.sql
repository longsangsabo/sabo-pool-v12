
-- Update RLS policies to reference tournament_matches instead of sabo_tournament_matches
-- This script is safe to run multiple times

-- Drop old policies if they exist (might be on the renamed table)
DO $$ 
BEGIN
  -- Drop policies on old table name (if it still exists)
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'sabo_tournament_matches') THEN
    DROP POLICY IF EXISTS "Users can view sabo tournament matches" ON sabo_tournament_matches;
    DROP POLICY IF EXISTS "Tournament organizers can manage sabo matches" ON sabo_tournament_matches;
    DROP POLICY IF EXISTS "Admins can manage all sabo matches" ON sabo_tournament_matches;
  END IF;
  
  -- Ensure correct policies exist on tournament_matches
  DROP POLICY IF EXISTS "Users can view tournament matches" ON tournament_matches;
  DROP POLICY IF EXISTS "Tournament organizers can manage matches" ON tournament_matches;
  DROP POLICY IF EXISTS "Admins can manage all matches" ON tournament_matches;
  
  -- Create updated policies
  CREATE POLICY "Users can view tournament matches" ON tournament_matches
    FOR SELECT USING (true);
    
  CREATE POLICY "Tournament organizers can manage matches" ON tournament_matches
    FOR ALL USING (
      auth.uid() IN (
        SELECT t.created_by FROM tournaments t WHERE t.id = tournament_matches.tournament_id
      )
    );
    
  CREATE POLICY "Admins can manage all matches" ON tournament_matches
    FOR ALL USING (
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
      )
    );
    
  RAISE NOTICE '✅ RLS policies updated for tournament_matches';
END $$;
