-- Check RLS policies for rank_requests table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'rank_requests';

-- Check current user permissions
SELECT current_user, current_setting('role');

-- Check if RLS is enabled on rank_requests
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'rank_requests';

-- Test query to see what rank_requests current user can see
SELECT id, user_id, club_id, status, requested_rank 
FROM rank_requests 
WHERE id = '2285d8c6-333a-40d8-84d2-0735b6e45915';
