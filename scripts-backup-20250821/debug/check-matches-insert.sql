-- =============================================
-- DEBUG: Kiểm tra nguyên nhân insert 0/27
-- Thay 'YOUR_TOURNAMENT_ID' bằng id thực
-- =============================================

-- 1. Xem các trigger trên bảng
SELECT event_manipulation AS action, trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'tournament_matches';

-- 2. Thử insert 1 dòng test hợp lệ
INSERT INTO tournament_matches(
  tournament_id, round_number, match_number, bracket_type, status
) VALUES (
  'YOUR_TOURNAMENT_ID', 1, 999, 'winners', 'pending'
) RETURNING id, round_number, match_number;

-- 3. Xoá dòng test
DELETE FROM tournament_matches 
WHERE match_number = 999 AND round_number = 1 AND tournament_id = 'YOUR_TOURNAMENT_ID';

SELECT '✅ Done' AS status;
