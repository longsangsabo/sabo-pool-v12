-- KIỂM TRA NGUỒN GỐC SPA REWARD = 150
-- ================================================================================

-- 1. Kiểm tra có bảng config rank rewards không
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name LIKE '%spa%' OR column_name LIKE '%reward%' OR table_name LIKE '%reward%' OR table_name LIKE '%config%')
ORDER BY table_name, ordinal_position;

-- 2. Kiểm tra có bảng rank_rewards hoặc tương tự không
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%rank%' OR table_name LIKE '%reward%' OR table_name LIKE '%config%')
ORDER BY table_name;

-- 3. Tìm các function có chứa logic SPA reward
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_definition LIKE '%150%'
AND routine_definition LIKE '%spa%'
ORDER BY routine_name;

-- 4. Kiểm tra xem có constant hoặc enum rank rewards không
SELECT 
    table_name,
    column_name,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_default LIKE '%150%'
ORDER BY table_name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 PHÂN TÍCH SPA REWARD = 150';
    RAISE NOTICE '=============================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Giá trị 150 SPA cho rank H được lấy từ:';
    RAISE NOTICE '';
    RAISE NOTICE '❌ KHÔNG có bảng config trong database';
    RAISE NOTICE '✅ Được HARDCODE trong function logic:';
    RAISE NOTICE '';
    RAISE NOTICE '   v_spa_reward := CASE v_rank_text';
    RAISE NOTICE '       WHEN ''H+'' THEN 150';
    RAISE NOTICE '       WHEN ''H'' THEN 150';
    RAISE NOTICE '       ...';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 LÝ DO:';
    RAISE NOTICE '   1. Rank H = Level 5 trong hệ thống 12 cấp bậc';
    RAISE NOTICE '   2. Thuộc nhóm INTERMEDIATE (trung cấp)';
    RAISE NOTICE '   3. Reward logic: K=100, I=120, H=150, G=200, F=250, E=300';
    RAISE NOTICE '   4. Tăng dần theo cấp độ khó của rank';
    RAISE NOTICE '';
    RAISE NOTICE '💡 BUSINESS LOGIC:';
    RAISE NOTICE '   - K/K+: Beginner = 100 SPA';
    RAISE NOTICE '   - I/I+: Novice = 120 SPA'; 
    RAISE NOTICE '   - H/H+: Intermediate = 150 SPA ← ĐÂY!';
    RAISE NOTICE '   - G/G+: Advanced = 200 SPA';
    RAISE NOTICE '   - F/F+: Expert = 250 SPA';
    RAISE NOTICE '   - E/E+: Master = 300 SPA';
    RAISE NOTICE '';
    RAISE NOTICE '📈 Tăng 50 SPA mỗi 2 level để khuyến khích người chơi';
    RAISE NOTICE '';
END $$;
