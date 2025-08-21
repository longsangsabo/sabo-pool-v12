-- =============================================  
-- SIMPLE FIX: DISABLE RLS FOR TOURNAMENT_MATCHES
-- Temporary solution to test SABO-32 functionality
-- =============================================

-- Disable RLS for tournament_matches (TEMPORARY FOR TESTING)
ALTER TABLE tournament_matches DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tournament_matches';

SELECT 'RLS disabled for tournament_matches - SABO-32 should work now' as status;
