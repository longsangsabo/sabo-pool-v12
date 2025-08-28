
-- Test if the safe function works
SELECT 
    routine_name,
    routine_type,
    specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'manual_approve_rank_request';

-- Show the current function (if it exists)
\d+ manual_approve_rank_request;
    