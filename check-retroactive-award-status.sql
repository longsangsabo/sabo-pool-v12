-- ============================================================================
-- COMPREHENSIVE RETROACTIVE AWARD STATUS CHECK
-- ============================================================================
-- Purpose: Check status of retroactive milestone awards for all users
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

DO $$
DECLARE
    total_users INTEGER := 0;
    users_with_milestones INTEGER := 0;
    users_without_milestones INTEGER := 0;
    total_spa_awarded INTEGER := 0;
    user_record RECORD;
    milestone_count INTEGER;
    spa_from_milestones INTEGER;
BEGIN
    RAISE NOTICE '📊 COMPREHENSIVE RETROACTIVE AWARD STATUS CHECK';
    RAISE NOTICE '%', REPEAT('=', 60);
    RAISE NOTICE '';

    -- 1. Overall statistics
    RAISE NOTICE '1. 📈 OVERALL STATISTICS:';
    
    SELECT COUNT(*) INTO total_users FROM player_rankings;
    RAISE NOTICE '   ✅ Total users in player_rankings: %', total_users;
    
    SELECT COUNT(DISTINCT player_id) INTO users_with_milestones FROM player_milestones;
    RAISE NOTICE '   ✅ Users with milestone progress: %', users_with_milestones;
    
    users_without_milestones := total_users - users_with_milestones;
    RAISE NOTICE '   ⚠️  Users WITHOUT milestone progress: %', users_without_milestones;
    
    SELECT COALESCE(SUM(spa_reward), 0) INTO total_spa_awarded 
    FROM player_milestones pm 
    JOIN milestones m ON pm.milestone_id = m.id 
    WHERE pm.is_completed = true;
    RAISE NOTICE '   💰 Total SPA awarded from milestones: %', total_spa_awarded;
    RAISE NOTICE '';

    -- 2. Available milestones
    RAISE NOTICE '2. 🏆 AVAILABLE MILESTONES:';
    FOR user_record IN
        SELECT * FROM milestones 
        WHERE milestone_type IN ('account_creation', 'rank_registration')
        AND is_active = true
        ORDER BY milestone_type
    LOOP
        RAISE NOTICE '   ✅ %: % SPA', user_record.name, user_record.spa_reward;
    END LOOP;
    RAISE NOTICE '';

    -- 3. Check users without milestone progress (these should have been processed by retroactive script)
    RAISE NOTICE '3. 🔍 USERS WITHOUT MILESTONE PROGRESS:';
    IF users_without_milestones > 0 THEN
        RAISE NOTICE '   ⚠️  Found % users without any milestone progress!', users_without_milestones;
        RAISE NOTICE '   📋 These users should have been processed by retroactive script:';
        
        FOR user_record IN 
            SELECT pr.user_id, pr.spa_points, pr.created_at
            FROM player_rankings pr
            WHERE pr.user_id NOT IN (
                SELECT DISTINCT pm.player_id 
                FROM player_milestones pm 
                WHERE pm.player_id IS NOT NULL
            )
            LIMIT 10 -- Show first 10 users as examples
        LOOP
            RAISE NOTICE '      - User: % | SPA: % | Created: %', 
                SUBSTRING(user_record.user_id::text, 1, 8) || '...',
                COALESCE(user_record.spa_points, 0),
                user_record.created_at;
        END LOOP;
        
        IF users_without_milestones > 10 THEN
            RAISE NOTICE '      ... and % more users', users_without_milestones - 10;
        END IF;
    ELSE
        RAISE NOTICE '   ✅ All users have milestone progress records!';
    END IF;
    RAISE NOTICE '';

    -- 4. Check recent milestone completions (from retroactive script)
    RAISE NOTICE '4. 📅 RECENT MILESTONE COMPLETIONS:';
    FOR user_record IN
        SELECT 
            pm.player_id,
            pm.completed_at,
            m.name,
            m.spa_reward,
            pm.times_completed
        FROM player_milestones pm
        JOIN milestones m ON pm.milestone_id = m.id
        WHERE pm.completed_at >= NOW() - INTERVAL '24 hours'
        AND pm.is_completed = true
        ORDER BY pm.completed_at DESC
        LIMIT 20
    LOOP
        RAISE NOTICE '   ✅ % completed % (+% SPA) at %',
            SUBSTRING(user_record.player_id::text, 1, 8) || '...',
            user_record.name,
            user_record.spa_reward,
            user_record.completed_at;
    END LOOP;
    
    IF NOT FOUND THEN
        RAISE NOTICE '   ❌ No milestone completions in last 24 hours';
    END IF;
    RAISE NOTICE '';

    -- 5. Check recent SPA transactions (from retroactive awards)
    RAISE NOTICE '5. 💳 RECENT SPA TRANSACTIONS:';
    FOR user_record IN
        SELECT 
            user_id,
            amount,
            transaction_type,
            description,
            created_at
        FROM spa_transactions
        WHERE transaction_type = 'retroactive_milestone'
        AND created_at >= NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 20
    LOOP
        RAISE NOTICE '   ✅ % got +% SPA (%)',
            SUBSTRING(user_record.user_id::text, 1, 8) || '...',
            user_record.amount,
            user_record.description;
    END LOOP;
    
    IF NOT FOUND THEN
        RAISE NOTICE '   ❌ No retroactive SPA transactions in last 24 hours';
    END IF;
    RAISE NOTICE '';

    -- 6. Check recent notifications
    RAISE NOTICE '6. 🔔 RECENT MILESTONE NOTIFICATIONS:';
    FOR user_record IN
        SELECT 
            user_id,
            title,
            message,
            created_at,
            metadata
        FROM challenge_notifications
        WHERE type = 'milestone_completed'
        AND created_at >= NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        RAISE NOTICE '   ✅ % - %',
            SUBSTRING(user_record.user_id::text, 1, 8) || '...',
            user_record.title;
        RAISE NOTICE '      Message: %', user_record.message;
        IF user_record.metadata ? 'retroactive' THEN
            RAISE NOTICE '      🔄 RETROACTIVE: %', user_record.metadata->>'retroactive';
        END IF;
        RAISE NOTICE '';
    END LOOP;
    
    IF NOT FOUND THEN
        RAISE NOTICE '   ❌ No milestone notifications in last 24 hours';
    END IF;

    -- 7. Summary and recommendations
    RAISE NOTICE '7. 📋 SUMMARY & RECOMMENDATIONS:';
    RAISE NOTICE '';
    
    IF users_without_milestones > 0 THEN
        RAISE NOTICE '   ⚠️  ISSUE DETECTED:';
        RAISE NOTICE '   • % users still missing milestone progress', users_without_milestones;
        RAISE NOTICE '   • Retroactive script may not have run successfully';
        RAISE NOTICE '   • Or there was an error during execution';
        RAISE NOTICE '';
        RAISE NOTICE '   🔧 RECOMMENDED ACTIONS:';
        RAISE NOTICE '   1. Re-run the retroactive milestone award script';
        RAISE NOTICE '   2. Check Supabase logs for any errors';
        RAISE NOTICE '   3. Verify all required functions exist:';
        RAISE NOTICE '      - update_spa_points()';
        RAISE NOTICE '      - create_challenge_notification()';
    ELSE
        RAISE NOTICE '   ✅ STATUS: All users have milestone progress!';
        RAISE NOTICE '   ✅ Retroactive awards appear to have been successful';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🏁 COMPREHENSIVE CHECK COMPLETE';

END $$;
