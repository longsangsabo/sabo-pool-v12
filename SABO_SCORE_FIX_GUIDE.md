# 🔧 HƯỚNG DẪN SỬA LỖI SABO SCORE SUBMISSION

## ✅ VẤN ĐỀ ĐÃ ĐƯỢC XÁC ĐỊNH:

1. **Function `submit_sabo_match_score` đang tìm match trong table SAI**
   - Hiện tại: tìm trong `tournament_matches` 
   - Cần sửa: tìm trong `sabo_tournament_matches`

2. **Columns đã đúng**: `score_player1`, `score_player2`

3. **Frontend đã được sửa** để đọc đúng columns

## 🛠️ CÁCH SỬA (CHẠY MANUAL):

### Bước 1: Mở Supabase SQL Editor
1. Truy cập: https://supabase.com/dashboard
2. Chọn project: `exlqvlbawytbglioqfbc`
3. Vào SQL Editor

### Bước 2: Chạy SQL sau để sửa function

```sql
-- Drop existing function
DROP FUNCTION IF EXISTS submit_sabo_match_score(UUID, INTEGER, INTEGER, UUID);

-- Create corrected function that uses sabo_tournament_matches table
CREATE OR REPLACE FUNCTION submit_sabo_match_score(
  p_match_id UUID,
  p_player1_score INTEGER,
  p_player2_score INTEGER,
  p_submitted_by UUID DEFAULT NULL
) RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_winner_id UUID;
  v_tournament_id UUID;
BEGIN
  -- FIXED: Get match details from SABO table (not tournament_matches)
  SELECT * INTO v_match FROM sabo_tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found in sabo_tournament_matches');
  END IF;
  
  v_tournament_id := v_match.tournament_id;
  
  -- Validate match status
  IF v_match.status NOT IN ('ready', 'in_progress', 'pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not ready for score submission');
  END IF;
  
  -- Validate scores
  IF p_player1_score < 0 OR p_player2_score < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid scores - must be non-negative');
  END IF;
  
  IF p_player1_score = p_player2_score THEN
    RETURN jsonb_build_object('success', false, 'error', 'SABO matches cannot be ties');
  END IF;
  
  -- Determine winner
  v_winner_id := CASE 
    WHEN p_player1_score > p_player2_score THEN v_match.player1_id
    ELSE v_match.player2_id
  END;
  
  -- FIXED: Update match with scores in SABO table
  UPDATE sabo_tournament_matches 
  SET 
    score_player1 = p_player1_score,
    score_player2 = p_player2_score,
    winner_id = v_winner_id,
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Score submitted successfully to sabo_tournament_matches',
    'scores_updated', true,
    'winner_id', v_winner_id,
    'match_completed', true,
    'player1_score', p_player1_score,
    'player2_score', p_player2_score,
    'table_used', 'sabo_tournament_matches'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'match_id', p_match_id,
      'table_used', 'sabo_tournament_matches'
    );
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION submit_sabo_match_score TO authenticated;
```

### Bước 3: Kiểm tra kết quả
Sau khi chạy SQL thành công, thử lại chức năng "Enter Score" trong browser.

## 🎯 SỬA ĐỔI ĐÃ THỰC HIỆN:

✅ **Frontend code đã được sửa**:
- `SABOMatchCard.tsx`: Đọc `match.score_player1` và `match.score_player2`
- `SABOLogicCore.ts`: Cập nhật interface với `score_player1`, `score_player2`
- `useSABOScoreSubmission.ts`: Fetch từ `sabo_tournament_matches` table

✅ **Function cần cập nhật** (chạy SQL ở trên):
- Tìm match trong `sabo_tournament_matches` thay vì `tournament_matches`
- Cập nhật đúng columns `score_player1`, `score_player2`

## 🧪 TEST SAU KHI SỬA:

1. Reload browser (Ctrl+F5)
2. Tìm một match với status "Ready" 
3. Click "Enter Score"
4. Nhập điểm (ví dụ: 7-3)
5. Click "Submit Score"
6. Kiểm tra điểm số có hiển thị trên card không

## 🚨 NẾU VẪN LỖI:

Chạy script test để debug:
```bash
node test-sabo-fix.mjs
```

---

**Tóm tắt**: Vấn đề chính là function database đang dùng sai table. Frontend đã được sửa, chỉ cần cập nhật function database là xong!
