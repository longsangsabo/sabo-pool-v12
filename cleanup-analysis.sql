-- ===================================================================
-- 🔍 CLEANUP ANALYSIS - Paste vào Supabase Dashboard  
-- Phân tích các objects cũ cần cleanup
-- ===================================================================

-- 🔍 CHECK OLD FUNCTIONS (có thể duplicate hoặc deprecated)
SELECT 
  '🔧 OLD FUNCTIONS ANALYSIS' as category,
  proname as function_name,
  pronargs as param_count,
  pg_get_function_identity_arguments(p.oid) as parameters,
  obj_description(p.oid) as description
FROM pg_proc p
WHERE proname LIKE '%double_elimination%' 
   OR proname LIKE '%sabo%'
   OR proname LIKE '%tournament%'
   OR proname LIKE '%bracket%'
   OR proname LIKE '%advance%'
   OR proname LIKE '%elimination%'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname, pronargs;

-- 🔍 CHECK OLD TRIGGERS  
SELECT 
  '🔧 OLD TRIGGERS ANALYSIS' as category,
  trigger_name,
  event_object_table,
  action_timing || ' ' || event_manipulation as trigger_event,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%double_elimination%'
   OR trigger_name LIKE '%sabo%' 
   OR trigger_name LIKE '%tournament%'
   OR trigger_name LIKE '%bracket%'
   OR trigger_name LIKE '%advance%'
   OR trigger_name LIKE '%elimination%'
   OR event_object_table LIKE '%tournament%'
AND trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 🔍 CHECK OLD TABLES (có thể leftover)
SELECT 
  '📊 OLD TABLES ANALYSIS' as category,
  table_name,
  table_type,
  (xpath('/row/c/text()', query_to_xml(format('SELECT COUNT(*) as c FROM %I', table_name), false, true, '')))[1]::text::int as record_count
FROM information_schema.tables 
WHERE (table_name LIKE '%tournament%' 
    OR table_name LIKE '%bracket%'
    OR table_name LIKE '%elimination%'
    OR table_name LIKE '%sabo%'
    OR table_name LIKE '%backup%'
    OR table_name LIKE '%temp%'
    OR table_name LIKE '%old%'
    OR table_name LIKE '%legacy%')
  AND table_schema = 'public'
  AND table_name NOT IN ('tournaments', 'tournament_matches', 'tournament_results', 'tournament_registrations')
ORDER BY table_name;

-- 🔍 CHECK OLD INDEXES (có thể duplicate)
SELECT 
  '🔍 OLD INDEXES ANALYSIS' as category,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE (indexname LIKE '%tournament%' 
    OR indexname LIKE '%bracket%'
    OR indexname LIKE '%elimination%'
    OR indexname LIKE '%sabo%'
    OR tablename LIKE '%tournament%')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 🔍 CHECK OLD VIEWS
SELECT 
  '👁️ OLD VIEWS ANALYSIS' as category,
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE (table_name LIKE '%tournament%'
    OR table_name LIKE '%bracket%' 
    OR table_name LIKE '%elimination%'
    OR table_name LIKE '%sabo%')
  AND table_schema = 'public'
ORDER BY table_name;

-- 🔍 CHECK OLD POLICIES (có thể conflict)
SELECT 
  '🛡️ OLD POLICIES ANALYSIS' as category,
  tablename,
  policyname,
  cmd as policy_command,
  qual as policy_condition
FROM pg_policies 
WHERE (policyname LIKE '%tournament%'
    OR policyname LIKE '%bracket%'
    OR policyname LIKE '%elimination%'
    OR policyname LIKE '%sabo%'
    OR tablename LIKE '%tournament%')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

SELECT '🔍 ANALYSIS COMPLETED - Review results để identify cleanup targets' as status;
