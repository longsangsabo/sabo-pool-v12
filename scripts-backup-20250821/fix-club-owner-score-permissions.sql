-- 🔥 FIX CLUB OWNER QUYỀN NHẬP TỶ SỐ
-- Add specific policy for club owners to always have score submission rights

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tournament_matches';

-- Drop and recreate the organizer policy with better logic
DROP POLICY IF EXISTS "tournament_organizers_manage_matches" ON tournament_matches;

-- Create improved policy that includes club ownership
CREATE POLICY "tournament_organizers_manage_matches" ON tournament_matches
  FOR ALL USING (
    -- Tournament creator
    tournament_id IN (SELECT t.id FROM tournaments t WHERE t.created_by = auth.uid()) 
    OR
    -- Club owner (both direct ownership and club_profiles)
    tournament_id IN (
      SELECT t.id FROM tournaments t 
      JOIN club_profiles cp ON t.club_id = cp.id 
      WHERE cp.user_id = auth.uid()
    )
    OR
    -- Admin users
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Also add a specific policy for club owners if needed
CREATE POLICY "club_owners_manage_all_club_matches" ON tournament_matches
  FOR ALL USING (
    club_id IN (SELECT cp.id FROM club_profiles cp WHERE cp.user_id = auth.uid())
  );

SELECT '✅ Club owner permissions fixed for tournament_matches' as status;
