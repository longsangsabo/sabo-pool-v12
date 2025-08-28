-- =============================================
-- AUTO SYNC VERIFIED RANK TO CURRENT RANK
-- For both PLAYER_RANKINGS and PROFILES tables
-- Trigger functions to sync verified_rank to current_rank when verified_rank is updated
-- =============================================

-- =============================================
-- 1. PLAYER_RANKINGS TABLE TRIGGER
-- =============================================

-- Create the trigger function for player_rankings
CREATE OR REPLACE FUNCTION sync_verified_to_current_rank_player_rankings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only sync if verified_rank is not null and different from current_rank
    IF NEW.verified_rank IS NOT NULL AND (OLD.verified_rank IS NULL OR NEW.verified_rank != OLD.verified_rank) THEN
        -- Update current_rank to match verified_rank
        NEW.current_rank := NEW.verified_rank;
        
        -- Log the sync operation
        RAISE NOTICE 'PLAYER_RANKINGS: Auto-synced verified_rank % to current_rank for user %', 
                     NEW.verified_rank, NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_verified_to_current_rank_player_rankings ON player_rankings;

-- Create the trigger for player_rankings
CREATE TRIGGER trigger_sync_verified_to_current_rank_player_rankings
    BEFORE UPDATE ON player_rankings
    FOR EACH ROW
    EXECUTE FUNCTION sync_verified_to_current_rank_player_rankings();

-- =============================================
-- 2. PROFILES TABLE TRIGGER
-- =============================================

-- Create the trigger function for profiles
CREATE OR REPLACE FUNCTION sync_verified_to_current_rank_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only sync if verified_rank is not null and different from current_rank
    IF NEW.verified_rank IS NOT NULL AND (OLD.verified_rank IS NULL OR NEW.verified_rank != OLD.verified_rank) THEN
        -- Update current_rank to match verified_rank
        NEW.current_rank := NEW.verified_rank;
        
        -- Log the sync operation
        RAISE NOTICE 'PROFILES: Auto-synced verified_rank % to current_rank for user %', 
                     NEW.verified_rank, NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_verified_to_current_rank_profiles ON profiles;

-- Create the trigger for profiles
CREATE TRIGGER trigger_sync_verified_to_current_rank_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_verified_to_current_rank_profiles();

-- =============================================
-- 3. GRANT PERMISSIONS
-- =============================================

-- Grant permissions for both functions
GRANT EXECUTE ON FUNCTION sync_verified_to_current_rank_player_rankings TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION sync_verified_to_current_rank_profiles TO authenticated, anon, service_role;

-- =============================================
-- 4. HELPER FUNCTIONS FOR BULK SYNC
-- =============================================

-- Manual sync function for player_rankings
CREATE OR REPLACE FUNCTION manual_sync_all_verified_ranks_player_rankings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Update all records where verified_rank is not null and different from current_rank
    UPDATE player_rankings 
    SET current_rank = verified_rank,
        updated_at = NOW()
    WHERE verified_rank IS NOT NULL 
      AND (current_rank IS NULL OR current_rank != verified_rank);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'PLAYER_RANKINGS: Manually synced % records from verified_rank to current_rank', updated_count;
    
    RETURN updated_count;
END;
$$;

-- Manual sync function for profiles
CREATE OR REPLACE FUNCTION manual_sync_all_verified_ranks_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Update all records where verified_rank is not null and different from current_rank
    UPDATE profiles 
    SET current_rank = verified_rank,
        updated_at = NOW()
    WHERE verified_rank IS NOT NULL 
      AND (current_rank IS NULL OR current_rank != verified_rank);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'PROFILES: Manually synced % records from verified_rank to current_rank', updated_count;
    
    RETURN updated_count;
END;
$$;

-- Combined sync function for both tables
CREATE OR REPLACE FUNCTION manual_sync_all_verified_ranks_both_tables()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    player_rankings_count INTEGER := 0;
    profiles_count INTEGER := 0;
BEGIN
    -- Sync player_rankings
    SELECT manual_sync_all_verified_ranks_player_rankings() INTO player_rankings_count;
    
    -- Sync profiles
    SELECT manual_sync_all_verified_ranks_profiles() INTO profiles_count;
    
    RETURN json_build_object(
        'success', true,
        'player_rankings_synced', player_rankings_count,
        'profiles_synced', profiles_count,
        'total_synced', player_rankings_count + profiles_count
    );
END;
$$;

-- Grant permissions for helper functions
GRANT EXECUTE ON FUNCTION manual_sync_all_verified_ranks_player_rankings TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION manual_sync_all_verified_ranks_profiles TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION manual_sync_all_verified_ranks_both_tables TO authenticated, anon, service_role;

-- =============================================
-- 5. TEST VERIFICATION QUERIES (Optional)
-- =============================================

-- Test triggers by updating verified_rank in both tables
-- Replace USER_ID_HERE with actual user IDs from your tables

/*
-- Test player_rankings trigger
UPDATE player_rankings 
SET verified_rank = 'A+' 
WHERE user_id = 'USER_ID_HERE';

-- Check if it synced
SELECT user_id, verified_rank, current_rank, updated_at 
FROM player_rankings 
WHERE user_id = 'USER_ID_HERE';

-- Test profiles trigger  
UPDATE profiles 
SET verified_rank = 'A+' 
WHERE user_id = 'USER_ID_HERE';

-- Check if it synced
SELECT user_id, verified_rank, current_rank, updated_at 
FROM profiles 
WHERE user_id = 'USER_ID_HERE';
*/

-- =============================================
-- 6. USAGE EXAMPLES
-- =============================================

-- Manually sync all existing verified_rank values in both tables:
-- SELECT manual_sync_all_verified_ranks_both_tables();

-- Sync only player_rankings:
-- SELECT manual_sync_all_verified_ranks_player_rankings();

-- Sync only profiles:
-- SELECT manual_sync_all_verified_ranks_profiles();

-- Check current status of both tables:
/*
SELECT 'player_rankings' as table_name, 
       COUNT(*) as total_records,
       COUNT(verified_rank) as has_verified_rank,
       COUNT(CASE WHEN verified_rank IS NOT NULL AND verified_rank = current_rank THEN 1 END) as synced_records
FROM player_rankings
UNION ALL
SELECT 'profiles' as table_name,
       COUNT(*) as total_records, 
       COUNT(verified_rank) as has_verified_rank,
       COUNT(CASE WHEN verified_rank IS NOT NULL AND verified_rank = current_rank THEN 1 END) as synced_records
FROM profiles;
*/

-- Check triggers status:
/*
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_name LIKE '%sync_verified_to_current_rank%';
*/

-- =============================================
-- 7. CLEANUP (if needed)
-- =============================================

-- To remove all triggers and functions:
/*
DROP TRIGGER IF EXISTS trigger_sync_verified_to_current_rank_player_rankings ON player_rankings;
DROP TRIGGER IF EXISTS trigger_sync_verified_to_current_rank_profiles ON profiles;
DROP FUNCTION IF EXISTS sync_verified_to_current_rank_player_rankings();
DROP FUNCTION IF EXISTS sync_verified_to_current_rank_profiles();
DROP FUNCTION IF EXISTS manual_sync_all_verified_ranks_player_rankings();
DROP FUNCTION IF EXISTS manual_sync_all_verified_ranks_profiles();
DROP FUNCTION IF EXISTS manual_sync_all_verified_ranks_both_tables();
*/
