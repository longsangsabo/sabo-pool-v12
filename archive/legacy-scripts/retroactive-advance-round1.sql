-- =============================================================
-- ♻️ RETROACTIVE ADVANCEMENT: Chạy nếu Round 1 đã hoàn tất trước khi fix function
-- Mục tiêu: Gán lại winner vào Round 2 & loser vào Round 101 cho mỗi match Round 1 completed
-- Idempotent: Nếu slot đã được gán sẽ bỏ qua (function tự kiểm tra slot trống)
-- Thay :tournament_id trước khi chạy
-- =============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT 
      id,
      tournament_id,
      winner_id,
      CASE WHEN winner_id = player1_id THEN player2_id ELSE player1_id END AS loser_id
    FROM tournament_matches
    WHERE tournament_id = :tournament_id
      AND round_number = 1
      AND status = 'completed'
  ) LOOP
    IF r.winner_id IS NOT NULL THEN
      PERFORM assign_participant_to_next_match(r.tournament_id, 2, r.winner_id);
    END IF;
    IF r.loser_id IS NOT NULL THEN
      PERFORM assign_participant_to_next_match(r.tournament_id, 101, r.loser_id);
    END IF;
  END LOOP;
  RAISE NOTICE 'Retroactive advancement processed for Round 1';
END $$;

SELECT '✅ Retroactive advancement executed' AS status;
