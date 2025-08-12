-- Step 3: Enable RLS and create policies
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are viewable by everyone" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tournaments" ON tournaments
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Tournament organizers can update their tournaments" ON tournaments
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Tournament organizers can delete their tournaments" ON tournaments
  FOR DELETE TO authenticated
  USING (true);
