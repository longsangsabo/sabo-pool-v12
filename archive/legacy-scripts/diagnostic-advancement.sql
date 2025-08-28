-- =============================================================
-- 🔍 DIAGNOSTIC SCRIPT: Kiểm tra tình trạng gán người & tiến độ
-- Sử dụng: chạy trên Supabase SQL Editor, thay :tournament_id bằng ID thực
-- =============================================================

-- Thống kê tổng quan mỗi round
SELECT 
  round_number,
  bracket_type,
  COUNT(*)                             AS total_matches,
  COUNT(*) FILTER (WHERE status='completed') AS completed,
  COUNT(*) FILTER (WHERE player1_id IS NOT NULL AND player2_id IS NOT NULL) AS filled,
  COUNT(*) FILTER (WHERE winner_id IS NOT NULL) AS with_winner
FROM tournament_matches
WHERE tournament_id = :tournament_id
GROUP BY 1,2
ORDER BY 1;

-- Round 1 completed matches
SELECT id, match_number, player1_id, player2_id, winner_id, status
FROM tournament_matches
WHERE tournament_id = :tournament_id
  AND round_number = 1
  AND status = 'completed'
ORDER BY match_number;

-- Round 2 slots
SELECT id, match_number, player1_id, player2_id, status
FROM tournament_matches
WHERE tournament_id = :tournament_id
  AND round_number = 2
ORDER BY match_number;

-- Losers 101
SELECT id, match_number, player1_id, player2_id, status
FROM tournament_matches
WHERE tournament_id = :tournament_id
  AND round_number = 101
ORDER BY match_number;

-- Các match còn thiếu người
SELECT round_number, match_number, id, player1_id, player2_id, status
FROM tournament_matches
WHERE tournament_id = :tournament_id
  AND (player1_id IS NULL OR player2_id IS NULL)
ORDER BY round_number, match_number;

SELECT '✅ Diagnostic complete' AS status;
