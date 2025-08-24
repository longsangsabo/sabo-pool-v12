-- KIỂM TRA SIGNATURE THỰC TẾ CỦA CÁC FUNCTIONS
-- ================================================

-- Check exact signatures of problematic functions
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as parameters,
    pronargs as num_args,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname IN (
    'accept_open_challenge',
    'accept_challenge',
    'complete_challenge_match',
    'create_challenge'
)
ORDER BY proname, pronargs;

-- Check if functions have any dependencies
SELECT 
    dependent_ns.nspname as dependent_schema,
    dependent_view.relname as dependent_table, 
    source_table.relname as source_table
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
JOIN pg_namespace dependent_ns ON dependent_ns.oid = dependent_view.relnamespace
WHERE pg_depend.refobjid IN (
    SELECT oid FROM pg_proc 
    WHERE proname LIKE '%challenge%' 
    LIMIT 5
);

-- Simple approach: Try dropping with CASCADE to see what depends on it
-- (We'll just check, not actually drop)
SELECT 
    'DROP FUNCTION IF EXISTS ' || proname || '(' || 
    pg_get_function_identity_arguments(oid) || ') CASCADE;' as drop_statement
FROM pg_proc 
WHERE proname IN (
    'accept_open_challenge',
    'accept_challenge_emergency_workaround', 
    'accept_open_challenge_fixed',
    'accept_open_challenge_simple'
)
ORDER BY proname;
