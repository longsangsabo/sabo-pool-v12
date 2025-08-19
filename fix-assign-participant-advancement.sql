-- =============================================================
-- 🛠 FIX FUNCTION: assign_participant_to_next_match
-- Mục tiêu:
--  1. Dùng bảng unified: tournament_matches
--  2. Nới điều kiện status: chấp nhận ('pending','ready') để tránh kẹt
--  3. Khoá bản ghi match chọn bằng FOR UPDATE SKIP LOCKED (an toàn concurrent)
--  4. Chỉ cập nhật slot còn trống, giữ slot đã có player
--  5. Trạng thái chuyển sang 'ready' khi đủ 2 người, ngược lại 'pending'
--  6. Thêm RAISE NOTICE để debug (có thể bỏ sau khi ổn định)
-- =============================================================

CREATE OR REPLACE FUNCTION assign_participant_to_next_match(
  p_tournament_id UUID,
  p_round_number INTEGER,
  p_participant_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match_id UUID;
  v_p1 UUID;
  v_p2 UUID;
  v_new_status TEXT;
BEGIN
  -- Chọn 1 match ở round cần gán còn trống >= 1 slot
  SELECT id, player1_id, player2_id
    INTO v_match_id, v_p1, v_p2
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id
    AND round_number = p_round_number
    AND (player1_id IS NULL OR player2_id IS NULL)
    AND status IN ('pending','ready')
  ORDER BY match_number
  LIMIT 1
  FOR UPDATE SKIP LOCKED;  -- tránh deadlock nếu nhiều tiến trình

  IF v_match_id IS NULL THEN
    RAISE NOTICE '[assign_participant] Không tìm thấy match trống cho round %', p_round_number;
    RETURN;
  END IF;

  -- Gán vào slot còn trống
  IF v_p1 IS NULL THEN
    v_p1 := p_participant_id;
  ELSIF v_p2 IS NULL THEN
    v_p2 := p_participant_id;
  ELSE
    -- Không còn slot
    RAISE NOTICE '[assign_participant] Match % round % đã đầy', v_match_id, p_round_number;
    RETURN;
  END IF;

  v_new_status := CASE WHEN v_p1 IS NOT NULL AND v_p2 IS NOT NULL THEN 'ready' ELSE 'pending' END;

  UPDATE tournament_matches
  SET player1_id = v_p1,
      player2_id = v_p2,
      status = v_new_status,
      updated_at = NOW()
  WHERE id = v_match_id;

  RAISE NOTICE '[assign_participant] Gán player % vào match % (round %) -> status %', p_participant_id, v_match_id, p_round_number, v_new_status;
END;
$$;

SELECT '✅ Updated assign_participant_to_next_match' AS status;
