-- =====================================================
-- SCRIPT TẠO 10 LEGACY SPA POINTS CODES ĐỂ TEST
-- =====================================================

-- Tạo 10 legacy SPA points entries với claim codes khác nhau để test tính năng
INSERT INTO public.legacy_spa_points (
  full_name,
  nick_name,
  position_rank,
  spa_points,
  tournament_name,
  tournament_date,
  claim_code,
  claimed,
  claimed_by,
  claimed_at,
  admin_notes
) VALUES 
-- Test Code 1: High value SPA
(
  'Nguyễn Văn Test',
  'TestPlayer01',
  1,
  1500,
  'SABO Championship 2024 - Test Tournament',
  '2024-12-01',
  'LEGACY-01-NGU',
  false,
  NULL,
  NULL,
  'Test code - Champion position'
),

-- Test Code 2: Medium value SPA
(
  'Trần Thị Demo',
  'DemoPlayer02',
  3,
  800,
  'SABO Open Test Event',
  '2024-11-15',
  'LEGACY-03-TRA',
  false,
  NULL,
  NULL,
  'Test code - Third place'
),

-- Test Code 3: Lower value SPA
(
  'Lê Minh Sample',
  'SampleUser03',
  8,
  300,
  'SABO Regional Test',
  '2024-10-20',
  'LEGACY-08-LEM',
  false,
  NULL,
  NULL,
  'Test code - Top 8 position'
),

-- Test Code 4: Already claimed (for testing error handling)
(
  'Phạm Văn Claimed',
  'AlreadyClaimed',
  2,
  1200,
  'SABO Masters Test',
  '2024-09-10',
  'LEGACY-02-PHA',
  true,
  gen_random_uuid(), -- Random UUID to simulate already claimed
  NOW() - INTERVAL '5 days',
  'Test code - Already claimed for testing'
),

-- Test Code 5: Participation points
(
  'Hoàng Thị Participant',
  'ParticipantTest',
  16,
  100,
  'SABO Beginner Test Tournament',
  '2024-08-25',
  'LEGACY-16-HOA',
  false,
  NULL,
  NULL,
  'Test code - Participation reward'
),

-- Test Code 6: Runner-up
(
  'Vũ Minh Runner',
  'RunnerUp06',
  2,
  1200,
  'SABO Elite Test Championship',
  '2024-07-30',
  'LEGACY-02-VUM',
  false,
  NULL,
  NULL,
  'Test code - Runner-up position'
),

-- Test Code 7: Quarter-finals
(
  'Đặng Thị Quarter',
  'QuarterTest07',
  5,
  500,
  'SABO Pro Test Series',
  '2024-06-15',
  'LEGACY-05-DAN',
  false,
  NULL,
  NULL,
  'Test code - Quarter-finals'
),

-- Test Code 8: High SPA Champion
(
  'Bùi Văn Champion',
  'ChampTest08',
  1,
  2000,
  'SABO Grand Test Final',
  '2024-05-20',
  'LEGACY-01-BUI',
  false,
  NULL,
  NULL,
  'Test code - Grand Champion with high SPA'
),

-- Test Code 9: Medium range
(
  'Mai Thị Middle',
  'MiddleTest09',
  6,
  400,
  'SABO Monthly Test Cup',
  '2024-04-10',
  'LEGACY-06-MAI',
  false,
  NULL,
  NULL,
  'Test code - Top 6 position'
),

-- Test Code 10: Special test case
(
  'Lý Văn Special',
  'SpecialTest10',
  4,
  700,
  'SABO Special Test Event',
  '2024-03-05',
  'LEGACY-04-LYV',
  false,
  NULL,
  NULL,
  'Test code - Fourth place special'
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Kiểm tra các codes vừa tạo
SELECT 
  id,
  full_name,
  nick_name,
  position_rank,
  spa_points,
  claim_code,
  claimed,
  tournament_name,
  admin_notes
FROM public.legacy_spa_points 
WHERE admin_notes LIKE '%Test code%'
ORDER BY position_rank;

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================

/*
📝 HƯỚNG DẪN SỬ DỤNG:

1. **Chạy script này trong Supabase SQL Editor**

2. **Test các claim codes sau:**
   - LEGACY-01-NGU (1500 SPA - Champion)
   - LEGACY-03-TRA (800 SPA - Third place)  
   - LEGACY-08-LEM (300 SPA - Top 8)
   - LEGACY-02-PHA (1200 SPA - ALREADY CLAIMED)
   - LEGACY-16-HOA (100 SPA - Participation)
   - LEGACY-02-VUM (1200 SPA - Runner-up)
   - LEGACY-05-DAN (500 SPA - Quarter-finals)
   - LEGACY-01-BUI (2000 SPA - Grand Champion)
   - LEGACY-06-MAI (400 SPA - Top 6)
   - LEGACY-04-LYV (700 SPA - Fourth place)

3. **Test scenarios:**
   ✅ Valid codes → Should claim successfully
   ❌ LEGACY-02-PHA → Should show "already claimed" error
   ❌ Invalid codes → Should show "code not found" error
   ❌ After claiming once → Should show "user already claimed" error

4. **Cleanup sau khi test:**
   DELETE FROM public.legacy_spa_points WHERE admin_notes LIKE '%Test code%';
*/
