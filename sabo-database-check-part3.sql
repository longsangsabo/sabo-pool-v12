-- ===================================================================
-- 🔍 SABO FUNCTIONS DETAILED ANALYSIS - PART 3  
-- Kiểm tra chi tiết cách SABO functions ghi data
-- ===================================================================

-- 📊 PHASE 9: FUNCTION SOURCE CODE ANALYSIS
SELECT 
  'SABO_FUNCTION_OPERATIONS' as analysis_type,
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%INSERT INTO tournament_matches%' THEN 'WRITES_TO_MATCHES'
    WHEN prosrc LIKE '%UPDATE tournament_matches%' THEN 'UPDATES_MATCHES'
    WHEN prosrc LIKE '%INSERT INTO tournaments%' THEN 'WRITES_TO_TOURNAMENTS'
    WHEN prosrc LIKE '%UPDATE tournaments%' THEN 'UPDATES_TOURNAMENTS'
    WHEN prosrc LIKE '%INSERT INTO tournament_results%' THEN 'WRITES_TO_RESULTS'
    ELSE 'READ_ONLY_OR_OTHER'
  END as operation_type,
  CASE 
    WHEN prosrc LIKE '%round_number%' THEN 'HANDLES_ROUNDS'
    WHEN prosrc LIKE '%bracket_type%' THEN 'HANDLES_BRACKETS'  
    WHEN prosrc LIKE '%winner_id%' THEN 'HANDLES_WINNERS'
    WHEN prosrc LIKE '%score_%' THEN 'HANDLES_SCORES'
    ELSE 'OTHER_OPERATIONS'
  END as data_handling
FROM pg_proc 
WHERE proname LIKE '%sabo%' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY function_name;

-- 📊 PHASE 10: TABLE INDEXES & PERFORMANCE
SELECT 
  'TABLE_INDEXES_ANALYSIS' as analysis_type,
  schemaname,
  tablename,
  indexname,
  indexdef,
  CASE 
    WHEN indexdef LIKE '%tournament_id%' THEN 'TOURNAMENT_RELATED'
    WHEN indexdef LIKE '%round_number%' OR indexdef LIKE '%match_number%' THEN 'SABO_STRUCTURE'
    WHEN indexdef LIKE '%player%_id%' THEN 'PLAYER_RELATED'
    WHEN indexdef LIKE '%status%' THEN 'STATUS_TRACKING'
    ELSE 'OTHER_INDEX'
  END as index_category
FROM pg_indexes 
WHERE tablename IN ('tournaments', 'tournament_matches', 'tournament_results')
ORDER BY tablename, index_category;

-- 📊 PHASE 11: RLS POLICIES SECURITY CHECK
SELECT 
  'RLS_POLICIES_ANALYSIS' as analysis_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as policy_command,
  CASE 
    WHEN policyname LIKE '%admin%' THEN 'ADMIN_ACCESS'
    WHEN policyname LIKE '%owner%' OR policyname LIKE '%club%' THEN 'OWNERSHIP_BASED'
    WHEN policyname LIKE '%participant%' OR policyname LIKE '%user%' THEN 'USER_BASED'
    WHEN policyname LIKE '%public%' OR policyname LIKE '%view%' THEN 'PUBLIC_ACCESS'
    ELSE 'OTHER_POLICY'
  END as policy_category
FROM pg_policies 
WHERE tablename IN ('tournaments', 'tournament_matches', 'tournament_results')
ORDER BY tablename, policy_category;

-- 📊 PHASE 12: FOREIGN KEY CONSTRAINTS CHECK
SELECT 
  'FOREIGN_KEYS_ANALYSIS' as analysis_type,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  CASE 
    WHEN kcu.column_name LIKE '%tournament_id%' THEN 'TOURNAMENT_RELATIONSHIP'
    WHEN kcu.column_name LIKE '%player%_id%' OR kcu.column_name LIKE '%user_id%' THEN 'USER_RELATIONSHIP'
    WHEN kcu.column_name LIKE '%winner_id%' THEN 'WINNER_RELATIONSHIP'
    ELSE 'OTHER_RELATIONSHIP'
  END as relationship_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('tournaments', 'tournament_matches', 'tournament_results')
ORDER BY tc.table_name, relationship_type;
