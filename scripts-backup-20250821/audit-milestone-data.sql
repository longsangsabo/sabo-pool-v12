-- Milestone System Data Audit Script
-- Checks current state of milestone tables and data

DO $$ 
DECLARE
  table_name TEXT;
  record_count INTEGER;
  table_exists BOOLEAN;
BEGIN
  RAISE NOTICE '🔍 MILESTONE SYSTEM DATA AUDIT';
  RAISE NOTICE '================================';
  RAISE NOTICE '';

  -- Check each milestone table
  FOR table_name IN VALUES ('milestones'), ('player_milestones'), ('milestone_events'), ('milestone_awards'), ('player_daily_progress'), ('player_login_streaks')
  LOOP
    -- Check if table exists
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = table_name
    ) INTO table_exists;
    
    IF table_exists THEN
      -- Get record count
      EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO record_count;
      RAISE NOTICE '✅ Table: % - Records: %', table_name, record_count;
      
      -- Additional details for key tables
      IF table_name = 'milestones' AND record_count > 0 THEN
        DECLARE
          milestone_stats RECORD;
        BEGIN
          FOR milestone_stats IN 
            EXECUTE format('SELECT category, COUNT(*) as count FROM public.%I WHERE is_active = true GROUP BY category ORDER BY category', table_name)
          LOOP
            RAISE NOTICE '    └─ %: % active milestones', milestone_stats.category, milestone_stats.count;
          END LOOP;
        END;
      END IF;
      
      IF table_name = 'player_milestones' AND record_count > 0 THEN
        DECLARE
          completion_stats RECORD;
        BEGIN
          EXECUTE format('
            SELECT 
              COUNT(*) as total_progress,
              COUNT(CASE WHEN is_completed THEN 1 END) as completed,
              COUNT(DISTINCT player_id) as unique_players
            FROM public.%I
          ', table_name) INTO completion_stats;
          RAISE NOTICE '    └─ Total progress records: %, Completed: %, Unique players: %', 
            completion_stats.total_progress, 
            completion_stats.completed, 
            completion_stats.unique_players;
        END;
      END IF;
      
    ELSE
      RAISE NOTICE '❌ Table: % - NOT FOUND', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 FUNCTION AUDIT:';
  RAISE NOTICE '==================';
  
  -- Check required functions
  FOR table_name IN VALUES ('get_user_milestone_progress'), ('create_challenge_notification'), ('get_user_milestone_stats'), ('initialize_user_milestones')
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = table_name
      AND routine_type = 'FUNCTION'
    ) INTO table_exists;
    
    IF table_exists THEN
      RAISE NOTICE '✅ Function: %', table_name;
    ELSE
      RAISE NOTICE '❌ Function: % - NOT FOUND', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔗 INTEGRATION CHECK:';
  RAISE NOTICE '====================';
  
  -- Check challenge_notifications table for notification integration
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'challenge_notifications'
  ) INTO table_exists;
  
  IF table_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM public.challenge_notifications WHERE type = ''milestone_completed''' INTO record_count;
    RAISE NOTICE '✅ Notification system: Available (% milestone notifications)', record_count;
  ELSE
    RAISE NOTICE '⚠️  Notification system: challenge_notifications table not found';
  END IF;
  
  -- Check SPA integration
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spa_transactions'
  ) INTO table_exists;
  
  IF table_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM public.spa_transactions WHERE source = ''milestone_award''' INTO record_count;
    RAISE NOTICE '✅ SPA integration: Available (% milestone rewards)', record_count;
  ELSE
    RAISE NOTICE '⚠️  SPA integration: spa_transactions table not found';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 AUDIT COMPLETE';
  
END $$;
