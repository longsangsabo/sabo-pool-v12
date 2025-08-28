-- ================================================================================
-- ADD PLAYER_ID COLUMN TO PLAYER_MILESTONES WITH AUTO SYNC
-- ================================================================================
-- Thêm cột player_id vào bảng player_milestones và tự động đồng bộ với user_id
-- ================================================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 Starting player_id column addition and sync setup...';
END $$;

-- Step 1: Add player_id column if not exists
-- ================================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_milestones' 
        AND column_name = 'player_id'
    ) THEN
        ALTER TABLE player_milestones 
        ADD COLUMN player_id UUID REFERENCES auth.users(id);
        
        RAISE NOTICE '✅ Added player_id column to player_milestones table';
    ELSE
        RAISE NOTICE '⚠️ player_id column already exists in player_milestones table';
    END IF;
END $$;

-- Step 2: Copy existing user_id values to player_id
-- ================================================================================
DO $$
BEGIN
    UPDATE player_milestones 
    SET player_id = user_id 
    WHERE player_id IS NULL AND user_id IS NOT NULL;
    
    RAISE NOTICE '📋 Synchronized existing user_id values to player_id';
END $$;

-- Step 3: Create trigger function for auto-sync
-- ================================================================================
CREATE OR REPLACE FUNCTION sync_player_milestones_ids()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Khi user_id thay đổi, tự động cập nhật player_id
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Đồng bộ player_id với user_id
        IF NEW.user_id IS NOT NULL THEN
            NEW.player_id := NEW.user_id;
        END IF;
        
        -- Đồng bộ user_id với player_id (fallback)
        IF NEW.player_id IS NOT NULL AND NEW.user_id IS NULL THEN
            NEW.user_id := NEW.player_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Step 4: Create triggers for auto-sync
-- ================================================================================
DO $$
BEGIN
    -- Drop existing trigger if exists
    DROP TRIGGER IF EXISTS trigger_sync_player_milestones_ids ON player_milestones;
    
    -- Create new trigger
    CREATE TRIGGER trigger_sync_player_milestones_ids
        BEFORE INSERT OR UPDATE ON player_milestones
        FOR EACH ROW
        EXECUTE FUNCTION sync_player_milestones_ids();
    
    RAISE NOTICE '🔄 Created auto-sync trigger for player_milestones';
END $$;

-- Step 5: Add unique constraint to ensure data consistency
-- ================================================================================
DO $$
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE player_milestones DROP CONSTRAINT IF EXISTS unique_user_milestone;
    ALTER TABLE player_milestones DROP CONSTRAINT IF EXISTS unique_player_milestone;
    
    -- Add new composite unique constraint
    ALTER TABLE player_milestones 
    ADD CONSTRAINT unique_user_player_milestone 
    UNIQUE (user_id, player_id, milestone_id);
    
    RAISE NOTICE '🔒 Added unique constraint for data consistency';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Constraint already exists or other error: %', SQLERRM;
END $$;

-- Step 6: Create helper function to ensure sync
-- ================================================================================
CREATE OR REPLACE FUNCTION ensure_player_milestones_sync()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_updated_count INTEGER := 0;
BEGIN
    -- Sync player_id where missing
    UPDATE player_milestones 
    SET player_id = user_id 
    WHERE player_id IS NULL AND user_id IS NOT NULL;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    -- Sync user_id where missing (fallback)
    UPDATE player_milestones 
    SET user_id = player_id 
    WHERE user_id IS NULL AND player_id IS NOT NULL;
    
    RETURN v_updated_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION ensure_player_milestones_sync() TO anon, authenticated;

-- Step 7: Run initial sync
-- ================================================================================
DO $$
DECLARE
    v_sync_result INTEGER;
BEGIN
    SELECT ensure_player_milestones_sync() INTO v_sync_result;
    RAISE NOTICE '📊 Synchronized % rows in player_milestones', v_sync_result;
END $$;

-- Step 8: Create index for performance
-- ================================================================================
DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_player_milestones_player_id 
    ON player_milestones(player_id);
    
    CREATE INDEX IF NOT EXISTS idx_player_milestones_user_player_milestone 
    ON player_milestones(user_id, player_id, milestone_id);
    
    RAISE NOTICE '📈 Created performance indexes';
END $$;

-- Step 9: Update the milestone completion functions to work with both columns
-- ================================================================================
CREATE OR REPLACE FUNCTION complete_milestone_dual_id(
    p_user_id UUID,
    p_milestone_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_milestone_record RECORD;
    v_result JSONB;
    v_already_completed BOOLEAN := false;
BEGIN
    -- Get milestone details
    SELECT * INTO v_milestone_record
    FROM milestones 
    WHERE id = p_milestone_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Milestone not found');
    END IF;
    
    -- Check if already completed (check both user_id and player_id)
    SELECT is_completed INTO v_already_completed
    FROM player_milestones 
    WHERE (user_id = p_user_id OR player_id = p_user_id) 
    AND milestone_id = p_milestone_id;
    
    IF v_already_completed THEN
        RETURN jsonb_build_object('success', false, 'error', 'Milestone already completed');
    END IF;
    
    -- Mark milestone as completed (with both IDs)
    INSERT INTO player_milestones (
        user_id,
        player_id,
        milestone_id, 
        current_progress, 
        is_completed, 
        completed_at,
        created_at
    ) VALUES (
        p_user_id,
        p_user_id,  -- player_id = user_id
        p_milestone_id,
        v_milestone_record.requirement_value,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, player_id, milestone_id) DO UPDATE SET
        current_progress = v_milestone_record.requirement_value,
        is_completed = true,
        completed_at = NOW(),
        updated_at = NOW();
    
    -- Award SPA points (using user_id for consistency)
    IF v_milestone_record.spa_reward > 0 THEN
        INSERT INTO player_rankings (user_id, spa_points, updated_at)
        VALUES (p_user_id, v_milestone_record.spa_reward, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            spa_points = player_rankings.spa_points + v_milestone_record.spa_reward,
            updated_at = NOW();
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'milestone_id', p_milestone_id,
        'user_id', p_user_id,
        'player_id', p_user_id,
        'spa_awarded', v_milestone_record.spa_reward
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION complete_milestone_dual_id(UUID, UUID) TO anon, authenticated;

-- Step 10: Verification and summary
-- ================================================================================
DO $$
DECLARE
    v_total_rows INTEGER;
    v_synced_rows INTEGER;
BEGIN
    -- Count total rows
    SELECT COUNT(*) INTO v_total_rows FROM player_milestones;
    
    -- Count properly synced rows
    SELECT COUNT(*) INTO v_synced_rows 
    FROM player_milestones 
    WHERE user_id = player_id;
    
    RAISE NOTICE '📊 Verification Results:';
    RAISE NOTICE '   • Total player_milestones rows: %', v_total_rows;
    RAISE NOTICE '   • Properly synced rows: %', v_synced_rows;
    
    IF v_total_rows = v_synced_rows THEN
        RAISE NOTICE '✅ All rows are properly synchronized!';
    ELSE
        RAISE NOTICE '⚠️ % rows need manual sync', (v_total_rows - v_synced_rows);
    END IF;
END $$;

-- Final notifications
DO $$
BEGIN
    RAISE NOTICE '🎉 Player ID addition and sync setup completed!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Features added:';
    RAISE NOTICE '   • player_id column in player_milestones table';
    RAISE NOTICE '   • Auto-sync trigger between user_id and player_id';
    RAISE NOTICE '   • Unique constraint for data consistency';
    RAISE NOTICE '   • Performance indexes';
    RAISE NOTICE '   • Helper functions for manual sync';
    RAISE NOTICE '   • Dual-ID milestone completion function';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Available functions:';
    RAISE NOTICE '   • ensure_player_milestones_sync() - Manual sync if needed';
    RAISE NOTICE '   • complete_milestone_dual_id() - Works with both ID columns';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Both user_id and player_id will be automatically synchronized!';
END $$;
