-- ===================================================================
-- 🧹 STEP 3: SAFE CLEANUP - Paste vào Supabase Dashboard  
-- Drop conflicting objects an toàn (có thể có một số lỗi, OK)
-- ===================================================================

-- Drop conflicting triggers (một số có thể không tồn tại - OK)
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v9 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS update_tournament_matches_updated_at ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS notify_winner_advancement_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_advance_double_elimination ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_update_tournament_matches_updated_at ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS auto_advance_double_elimination_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS tournament_match_winner_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS advance_winner_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_advance_double_elimination_fixed ON tournament_matches CASCADE;

-- Drop conflicting policies (một số có thể không tồn tại - OK)
DROP POLICY IF EXISTS "Club owners can manage their tournaments" ON tournaments;
DROP POLICY IF EXISTS "Everyone can view public tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can manage their registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Everyone can view registrations" ON tournament_registrations;
DROP POLICY IF EXISTS "Tournament participants and organizers can view matches" ON tournament_matches;
DROP POLICY IF EXISTS "Tournament organizers can manage matches" ON tournament_matches;
DROP POLICY IF EXISTS "Admins and club owners can view tournament results" ON tournament_results;
DROP POLICY IF EXISTS "System can insert tournament results" ON tournament_results;

-- Verification: Check what triggers remain
SELECT 
  '🔍 REMAINING TRIGGERS' as info,
  trigger_name,
  event_object_table,
  action_timing || ' ' || event_manipulation as trigger_timing
FROM information_schema.triggers
WHERE event_object_table LIKE '%tournament%'
  AND trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check what policies remain  
SELECT 
  '🔍 REMAINING POLICIES' as info,
  tablename,
  policyname,
  cmd as policy_command
FROM pg_policies 
WHERE tablename LIKE '%tournament%'
  AND schemaname = 'public'
ORDER BY tablename, policyname;
