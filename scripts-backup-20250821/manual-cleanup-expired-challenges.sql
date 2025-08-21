-- =====================================================
-- SCRIPT XÓA TỰ ĐỘNG THÁCH ĐẤU HẾT HẠN KHÔNG CÓ ĐỐI THỦ
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

-- 1. KIỂM TRA CÁC THÁCH ĐẤU HẾT HẠN TRƯỚC KHI XÓA
SELECT 
  id,
  challenger_id,
  opponent_id,
  status,
  bet_points,
  expires_at,
  created_at,
  CASE 
    WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'Hết hạn theo expires_at'
    WHEN expires_at IS NULL AND created_at < NOW() - INTERVAL '48 hours' THEN 'Hết hạn sau 48h'
    ELSE 'Chưa hết hạn'
  END as expiry_reason
FROM public.challenges 
WHERE status IN ('pending', 'open')
  AND (
    (expires_at IS NOT NULL AND expires_at < NOW()) 
    OR 
    (expires_at IS NULL AND created_at < NOW() - INTERVAL '48 hours')
  )
ORDER BY created_at DESC;

-- 2. CẬP NHẬT STATUS THÀNH 'expired' CHO NHỮNG THÁCH ĐẤU HẾT HẠN
UPDATE public.challenges 
SET 
  status = 'expired',
  updated_at = NOW()
WHERE status IN ('pending', 'open')
  AND (
    (expires_at IS NOT NULL AND expires_at < NOW()) 
    OR 
    (expires_at IS NULL AND created_at < NOW() - INTERVAL '48 hours')
  );

-- 3. HIỂN THỊ KẾT QUẢ SAU KHI CẬP NHẬT
SELECT 
  status,
  COUNT(*) as count
FROM public.challenges 
GROUP BY status
ORDER BY 
  CASE status 
    WHEN 'open' THEN 1 
    WHEN 'pending' THEN 2 
    WHEN 'accepted' THEN 3 
    WHEN 'completed' THEN 4 
    WHEN 'expired' THEN 5 
    ELSE 6 
  END;

-- 4. XEM CÁC THÁCH ĐẤU VỪA BỊ EXPIRED
SELECT 
  id,
  challenger_id,
  status,
  expires_at,
  updated_at,
  'Vừa được auto-expired' as note
FROM public.challenges 
WHERE status = 'expired' 
  AND updated_at > NOW() - INTERVAL '5 minutes'
ORDER BY updated_at DESC;
