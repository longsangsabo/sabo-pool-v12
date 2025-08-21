-- ============================================================================
-- CHECK SPECIFIC USER SPA STATUS - SQL VERSION
-- ============================================================================
-- Purpose: Check specific user SPA status after retroactive script
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

DO $$
DECLARE
    target_email TEXT := 'lss2ps@gmail.com';
    user_uuid UUID;
    user_record RECORD;
    milestone_record RECORD;
    transaction_record RECORD;
    notification_record RECORD;
BEGIN
    RAISE NOTICE '🔍 CHECKING USER SPA STATUS FOR: %', target_email;
    RAISE NOTICE '%', REPEAT('=', 60);
    RAISE NOTICE '';

    -- 1. Find user by email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = target_email;
    
    IF user_uuid IS NULL THEN
        RAISE NOTICE '❌ User not found in auth system';
        RETURN;
    END IF;
    
    RAISE NOTICE '1. 👤 USER BASIC INFO:';
    SELECT * INTO user_record FROM auth.users WHERE id = user_uuid;
    RAISE NOTICE '   ✅ User ID: %', SUBSTRING(user_uuid::text, 1, 8) || '...';
    RAISE NOTICE '   ✅ Email: %', user_record.email;
    RAISE NOTICE '   ✅ Created: %', user_record.created_at;
    RAISE NOTICE '';

    -- 2. Check player_rankings (SPA points)
    RAISE NOTICE '2. 💰 PLAYER RANKINGS & SPA:';
    SELECT * INTO user_record FROM player_rankings WHERE user_id = user_uuid;
    
    IF user_record IS NULL THEN
        RAISE NOTICE '   ❌ No ranking record found';
    ELSE
        RAISE NOTICE '   ✅ Current SPA: %', COALESCE(user_record.spa_points, 0);
        RAISE NOTICE '   ✅ Ranking created: %', user_record.created_at;
        RAISE NOTICE '   ✅ Last updated: %', user_record.updated_at;
    END IF;
    RAISE NOTICE '';

    -- 3. Check milestone progress
    RAISE NOTICE '3. 🏆 MILESTONE PROGRESS:';
    FOR milestone_record IN
        SELECT 
            pm.*,
            m.name,
            m.milestone_type,
            m.spa_reward,
            m.requirement_value
        FROM player_milestones pm
        JOIN milestones m ON pm.milestone_id = m.id
        WHERE pm.player_id = user_uuid
        ORDER BY pm.created_at
    LOOP
        RAISE NOTICE '   ✅ %', milestone_record.name;
        RAISE NOTICE '      Type: %', milestone_record.milestone_type;
        RAISE NOTICE '      SPA Reward: %', milestone_record.spa_reward;
        RAISE NOTICE '      Progress: %/%', milestone_record.current_progress, milestone_record.requirement_value;
        RAISE NOTICE '      Completed: %', CASE WHEN milestone_record.is_completed THEN '✅ Yes' ELSE '❌ No' END;
        RAISE NOTICE '      Completed at: %', COALESCE(milestone_record.completed_at::text, 'N/A');
        RAISE NOTICE '      Times completed: %', milestone_record.times_completed;
        RAISE NOTICE '';
    END LOOP;
    
    IF NOT FOUND THEN
        RAISE NOTICE '   ❌ No milestone progress found';
        RAISE NOTICE '';
    END IF;

    -- 4. Check SPA transaction history
    RAISE NOTICE '4. 📊 SPA TRANSACTION HISTORY:';
    FOR transaction_record IN
        SELECT * FROM spa_transactions 
        WHERE user_id = user_uuid 
        ORDER BY created_at DESC 
        LIMIT 10
    LOOP
        RAISE NOTICE '   % - % SPA', 
            transaction_record.transaction_type,
            CASE WHEN transaction_record.amount > 0 THEN '+' || transaction_record.amount::text ELSE transaction_record.amount::text END;
        RAISE NOTICE '      Description: %', transaction_record.description;
        RAISE NOTICE '      Date: %', transaction_record.created_at;
        IF transaction_record.reference_id IS NOT NULL THEN
            RAISE NOTICE '      Reference: %', transaction_record.reference_id;
        END IF;
        RAISE NOTICE '';
    END LOOP;
    
    IF NOT FOUND THEN
        RAISE NOTICE '   ❌ No SPA transactions found';
        RAISE NOTICE '';
    END IF;

    -- 5. Check recent notifications
    RAISE NOTICE '5. 🔔 RECENT NOTIFICATIONS:';
    FOR notification_record IN
        SELECT * FROM challenge_notifications 
        WHERE user_id = user_uuid 
        ORDER BY created_at DESC 
        LIMIT 5
    LOOP
        RAISE NOTICE '   % - %', notification_record.type, notification_record.title;
        RAISE NOTICE '      Message: %', notification_record.message;
        RAISE NOTICE '      Date: %', notification_record.created_at;
        RAISE NOTICE '      Read: %', CASE WHEN notification_record.is_read THEN '✅ Yes' ELSE '❌ No' END;
        IF notification_record.metadata IS NOT NULL THEN
            RAISE NOTICE '      Metadata: %', notification_record.metadata;
        END IF;
        RAISE NOTICE '';
    END LOOP;
    
    IF NOT FOUND THEN
        RAISE NOTICE '   ❌ No notifications found';
        RAISE NOTICE '';
    END IF;

    -- 6. Check eligibility and expected SPA
    RAISE NOTICE '6. 🎯 RETROACTIVE AWARD ANALYSIS:';
    DECLARE
        has_ranking BOOLEAN := false;
        expected_spa INTEGER := 0;
        current_spa INTEGER := 0;
        account_creation_spa INTEGER := 0;
        rank_registration_spa INTEGER := 0;
    BEGIN
        -- Check if user has ranking
        SELECT spa_points INTO current_spa FROM player_rankings WHERE user_id = user_uuid;
        has_ranking := current_spa IS NOT NULL;
        current_spa := COALESCE(current_spa, 0);
        
        -- Get milestone rewards
        SELECT spa_reward INTO account_creation_spa 
        FROM milestones 
        WHERE milestone_type = 'account_creation' AND is_active = true 
        LIMIT 1;
        
        SELECT spa_reward INTO rank_registration_spa 
        FROM milestones 
        WHERE milestone_type = 'rank_registration' AND is_active = true 
        LIMIT 1;
        
        account_creation_spa := COALESCE(account_creation_spa, 0);
        rank_registration_spa := COALESCE(rank_registration_spa, 0);
        
        expected_spa := account_creation_spa;
        IF has_ranking THEN
            expected_spa := expected_spa + rank_registration_spa;
        END IF;
        
        RAISE NOTICE '   ✅ Available milestones:';
        RAISE NOTICE '      - Account Creation: % SPA', account_creation_spa;
        RAISE NOTICE '      - Rank Registration: % SPA', rank_registration_spa;
        RAISE NOTICE '';
        RAISE NOTICE '   🔍 Eligibility check:';
        RAISE NOTICE '      - Has ranking record: %', CASE WHEN has_ranking THEN '✅ Yes' ELSE '❌ No' END;
        RAISE NOTICE '      - Should get account_creation: ✅ Yes (all users)';
        RAISE NOTICE '      - Should get rank_registration: %', CASE WHEN has_ranking THEN '✅ Yes' ELSE '❌ No' END;
        RAISE NOTICE '';
        RAISE NOTICE '   💰 SPA Analysis:';
        RAISE NOTICE '      - Expected SPA from milestones: %', expected_spa;
        RAISE NOTICE '      - Current SPA: %', current_spa;
        RAISE NOTICE '      - Difference: %', current_spa - expected_spa;
        
        IF current_spa < expected_spa THEN
            RAISE NOTICE '      ⚠️  USER IS MISSING % SPA!', expected_spa - current_spa;
        ELSIF current_spa = expected_spa THEN
            RAISE NOTICE '      ✅ SPA is correct!';
        ELSE
            RAISE NOTICE '      ✅ User has more SPA than expected (good!)';
        END IF;
    END;

    RAISE NOTICE '';
    RAISE NOTICE '🏁 ANALYSIS COMPLETE FOR: %', target_email;

END $$;
