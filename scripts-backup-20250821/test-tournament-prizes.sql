-- Test bảng tournament_prizes đã được tạo chưa
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'tournament_prizes';

-- Kiểm tra functions đã được tạo chưa
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'calculate_tournament_rewards';
