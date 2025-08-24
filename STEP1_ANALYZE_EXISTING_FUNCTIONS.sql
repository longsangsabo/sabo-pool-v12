-- =====================================================
-- 🔥 PHASE 1: COMPLETE FUNCTION ANALYSIS & BACKUP
-- =====================================================
-- This script will identify and backup all existing functions before cleanup

-- Step 1: Analyze existing functions
DO $$
DECLARE
    func_record RECORD;
    backup_sql TEXT := '';
BEGIN
    RAISE NOTICE '🔍 ANALYZING EXISTING CHALLENGE SYSTEM FUNCTIONS...';
    
    -- Get all challenge-related functions
    FOR func_record IN 
        SELECT 
            routine_name,
            routine_type,
            routine_schema,
            specific_name,
            routine_definition
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
          AND (
            routine_name ILIKE '%challenge%'
            OR routine_name ILIKE '%spa%'
            OR routine_name ILIKE '%accept%'
            OR routine_name ILIKE '%complete%'
            OR routine_name ILIKE '%approve%'
            OR routine_name ILIKE '%transfer%'
            OR routine_name ILIKE '%notification%'
          )
        ORDER BY routine_name
    LOOP
        RAISE NOTICE '📋 Found function: % (Type: %)', func_record.routine_name, func_record.routine_type;
    END LOOP;
    
    RAISE NOTICE '✅ Function analysis complete!';
END $$;

-- Step 2: Analyze existing triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '🔍 ANALYZING EXISTING TRIGGERS...';
    
    FOR trigger_record IN
        SELECT 
            trigger_name,
            event_object_table,
            action_timing,
            event_manipulation,
            action_statement
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
          AND (
            event_object_table IN ('challenges', 'matches', 'player_rankings', 'spa_transactions')
            OR action_statement ILIKE '%challenge%'
            OR action_statement ILIKE '%spa%'
            OR action_statement ILIKE '%club%'
          )
        ORDER BY event_object_table, trigger_name
    LOOP
        RAISE NOTICE '⚡ Found trigger: % on table % (% %)', 
            trigger_record.trigger_name, 
            trigger_record.event_object_table,
            trigger_record.action_timing,
            trigger_record.event_manipulation;
    END LOOP;
    
    RAISE NOTICE '✅ Trigger analysis complete!';
END $$;

-- Step 3: Get current database state for backup
SELECT 
    'CURRENT_FUNCTIONS' as category,
    routine_name as name,
    routine_type as type,
    'public' as schema
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND (
    routine_name ILIKE '%challenge%'
    OR routine_name ILIKE '%spa%'
    OR routine_name ILIKE '%accept%'
    OR routine_name ILIKE '%complete%'
  )

UNION ALL

SELECT 
    'CURRENT_TRIGGERS' as category,
    trigger_name as name,
    'TRIGGER' as type,
    trigger_schema as schema
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND (
    event_object_table IN ('challenges', 'matches', 'player_rankings')
    OR action_statement ILIKE '%challenge%'
    OR action_statement ILIKE '%spa%'
  )
ORDER BY category, name;
