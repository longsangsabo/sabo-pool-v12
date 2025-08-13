-- =====================================================
-- SCRIPT THÊM CỘT ELO_POINTS CHO BẢNG RANK_REQUESTS
-- Để tách biệt ELO (số) và RANK (chữ)
-- =====================================================

-- Bước 1: Kiểm tra cấu trúc hiện tại của bảng rank_requests
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rank_requests' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Bước 2: Thêm cột elo_points mới (nếu chưa có)
ALTER TABLE public.rank_requests 
ADD COLUMN IF NOT EXISTS elo_points INTEGER;

-- Bước 3: Copy dữ liệu từ requested_rank (INTEGER) sang elo_points
-- Chỉ thực hiện nếu requested_rank hiện tại là số ELO
UPDATE public.rank_requests 
SET elo_points = CASE 
  WHEN requested_rank::text ~ '^\d+$' THEN requested_rank::integer
  ELSE NULL
END
WHERE elo_points IS NULL;

-- Bước 4: Thêm comment cho cột mới
COMMENT ON COLUMN public.rank_requests.elo_points IS 'Điểm ELO yêu cầu (1000-2100+)';
COMMENT ON COLUMN public.rank_requests.requested_rank IS 'Hạng yêu cầu dưới dạng chữ (K, I, H, G, F, E)';

-- Bước 5: Tạo function để convert ELO thành rank chữ
CREATE OR REPLACE FUNCTION public.elo_to_rank_text(elo_points INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN elo_points >= 2100 THEN 'E+'
    WHEN elo_points >= 2000 THEN 'E'
    WHEN elo_points >= 1900 THEN 'F+'
    WHEN elo_points >= 1800 THEN 'F'
    WHEN elo_points >= 1700 THEN 'G+'
    WHEN elo_points >= 1600 THEN 'G'
    WHEN elo_points >= 1500 THEN 'H+'
    WHEN elo_points >= 1400 THEN 'H'
    WHEN elo_points >= 1300 THEN 'I+'
    WHEN elo_points >= 1200 THEN 'I'
    WHEN elo_points >= 1100 THEN 'K+'
    ELSE 'K'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Bước 6: Update requested_rank thành text format dựa trên elo_points
UPDATE public.rank_requests 
SET requested_rank = public.elo_to_rank_text(elo_points)
WHERE elo_points IS NOT NULL 
  AND (requested_rank IS NULL OR requested_rank::text ~ '^\d+$');

-- Bước 7: Kiểm tra kết quả
SELECT 
  id,
  user_id,
  requested_rank,
  elo_points,
  status,
  created_at,
  CASE 
    WHEN elo_points IS NOT NULL THEN public.elo_to_rank_text(elo_points)
    ELSE 'N/A'
  END as calculated_rank
FROM public.rank_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- Bước 8: Tạo view để hiển thị rank requests với format đẹp
CREATE OR REPLACE VIEW public.rank_requests_display AS
SELECT 
  rr.id,
  rr.user_id,
  p.full_name as player_name,
  rr.requested_rank as rank_text,
  rr.elo_points,
  CONCAT(rr.requested_rank, ' (', rr.elo_points, ' ELO)') as rank_display,
  rr.club_id,
  rr.status,
  rr.created_at,
  rr.updated_at,
  rr.approved_by,
  rr.approved_at
FROM public.rank_requests rr
LEFT JOIN public.profiles p ON p.user_id = rr.user_id
ORDER BY rr.created_at DESC;
