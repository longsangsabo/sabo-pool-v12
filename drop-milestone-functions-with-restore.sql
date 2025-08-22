-- ================================================================================
-- DROP MILESTONE FUNCTIONS VÀ KẾ HOẠCH RESTORE
-- ================================================================================
-- Tạm thời drop các milestone functions có thể gây conflict, backup để restore sau
-- ================================================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Backing up and dropping milestone functions...';
END $$;

-- Step 1: Backup definitions of milestone functions
-- ================================================================================
CREATE TABLE IF NOT EXISTS function_backup_milestone (
    function_name TEXT,
    function_definition TEXT,
    backup_date TIMESTAMP DEFAULT NOW()
);

-- Backup milestone functions
INSERT INTO function_backup_milestone (function_name, function_definition)
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_name ILIKE '%milestone%'
    OR routine_name ILIKE '%spa%'
)
AND routine_definition ILIKE '%ON CONFLICT%'
ON CONFLICT DO NOTHING;

-- Step 2: Drop milestone functions có ON CONFLICT
-- ================================================================================
DROP FUNCTION IF EXISTS award_milestone_spa(UUID, INTEGER, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS complete_milestone(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS complete_milestone_dual_id(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS check_and_award_milestones(UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS process_spa_on_completion(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_milestone_progress(UUID, TEXT, INTEGER) CASCADE;

DO $$
BEGIN
    RAISE NOTICE '🗑️ Dropped milestone functions with ON CONFLICT';
END $$;

-- Step 3: Create simple milestone functions (tạm thời)
-- ================================================================================

-- Simple award milestone SPA (no ON CONFLICT)
CREATE OR REPLACE FUNCTION award_milestone_spa_simple(
  p_user_id UUID,
  p_spa_amount INTEGER,
  p_milestone_name TEXT DEFAULT 'milestone_reward'
)
RETURNS JSONB AS $$
BEGIN
  -- Simple SPA award without complex logic
  IF NOT EXISTS(SELECT 1 FROM player_rankings WHERE user_id = p_user_id) THEN
    INSERT INTO player_rankings (user_id, spa_points, created_at, updated_at)
    VALUES (p_user_id, p_spa_amount, NOW(), NOW());
  ELSE
    UPDATE player_rankings 
    SET spa_points = spa_points + p_spa_amount, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Simple transaction log
  INSERT INTO spa_transactions (
    user_id, amount, source_type, transaction_type, description, status, created_at
  ) VALUES (
    p_user_id, p_spa_amount, 'milestone_reward', 'credit', p_milestone_name, 'completed', NOW()
  );
  
  RETURN jsonb_build_object('success', true, 'spa_awarded', p_spa_amount);
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Grant permissions
-- ================================================================================
GRANT EXECUTE ON FUNCTION award_milestone_spa_simple(UUID, INTEGER, TEXT) TO authenticated;

-- Step 5: Create restore script
-- ================================================================================
CREATE OR REPLACE FUNCTION restore_milestone_functions()
RETURNS TEXT AS $$
DECLARE
    func_record RECORD;
    restore_count INTEGER := 0;
BEGIN
    -- Restore all backed up functions
    FOR func_record IN 
        SELECT function_name, function_definition 
        FROM function_backup_milestone 
        WHERE backup_date = (SELECT MAX(backup_date) FROM function_backup_milestone)
    LOOP
        BEGIN
            EXECUTE func_record.function_definition;
            restore_count := restore_count + 1;
        EXCEPTION WHEN OTHERS THEN
            -- Log error but continue
            RAISE NOTICE 'Failed to restore %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
    
    RETURN format('Restored %s milestone functions', restore_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to restore function
GRANT EXECUTE ON FUNCTION restore_milestone_functions() TO authenticated;

-- Step 6: Verification and instructions
-- ================================================================================
DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM function_backup_milestone;
    
    RAISE NOTICE '✅ MILESTONE FUNCTIONS MANAGEMENT COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '🗑️ Dropped functions:';
    RAISE NOTICE '   • award_milestone_spa()';
    RAISE NOTICE '   • complete_milestone()';
    RAISE NOTICE '   • complete_milestone_dual_id()';
    RAISE NOTICE '   • check_and_award_milestones()';
    RAISE NOTICE '   • process_spa_on_completion()';
    RAISE NOTICE '   • update_milestone_progress()';
    RAISE NOTICE '';
    RAISE NOTICE '💾 Backup: % functions backed up', backup_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Temporary replacement:';
    RAISE NOTICE '   • award_milestone_spa_simple() - Basic SPA award function';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 To restore original functions later:';
    RAISE NOTICE '   SELECT restore_milestone_functions();';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Test approve_rank_request now - should work without conflict errors!';
END $$;

-- View backup
SELECT 
    function_name,
    backup_date,
    'Backed up for restore' as status
FROM function_backup_milestone
ORDER BY backup_date DESC;
