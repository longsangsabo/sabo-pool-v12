-- =====================================================
-- SETUP FUNCTION TỰ ĐỘNG XÓA THÁCH ĐẤU HẾT HẠN
-- Chạy script này để tạo function và cron job tự động
-- =====================================================

-- Tạo function tự động cleanup
CREATE OR REPLACE FUNCTION public.auto_cleanup_expired_challenges()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Cập nhật status thành 'expired' cho thách đấu hết hạn
  UPDATE public.challenges 
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE status IN ('pending', 'open')
    AND (
      -- Hết hạn theo expires_at
      (expires_at IS NOT NULL AND expires_at < NOW()) 
      OR 
      -- Hết hạn sau 48h nếu không có expires_at
      (expires_at IS NULL AND created_at < NOW() - INTERVAL '48 hours')
    );
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Log kết quả nếu có thách đấu bị expired
  IF expired_count > 0 THEN
    RAISE NOTICE 'Auto-expired % challenges', expired_count;
  END IF;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo function để xóa vĩnh viễn những thách đấu expired cũ (quá 30 ngày)
CREATE OR REPLACE FUNCTION public.delete_old_expired_challenges()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Xóa vĩnh viễn challenges đã expired quá 30 ngày
  DELETE FROM public.challenges 
  WHERE status = 'expired' 
    AND updated_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Deleted % old expired challenges', deleted_count;
  END IF;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test function (chạy thủ công để test)
-- SELECT public.auto_cleanup_expired_challenges();
-- SELECT public.delete_old_expired_challenges();

-- Setup cron job tự động (cần extension pg_cron)
-- Chạy mỗi giờ để cleanup thách đấu hết hạn
DO $$
BEGIN
  -- Kiểm tra xem cron job đã tồn tại chưa
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'hourly-challenge-cleanup') THEN
    PERFORM cron.unschedule('hourly-challenge-cleanup');
  END IF;
  
  -- Tạo cron job mới
  PERFORM cron.schedule(
    'hourly-challenge-cleanup',
    '0 * * * *', -- Mỗi giờ vào phút 0
    'SELECT public.auto_cleanup_expired_challenges();'
  );
  
  RAISE NOTICE 'Hourly challenge cleanup job scheduled successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule cron job (pg_cron extension may not be enabled): %', SQLERRM;
END
$$;

-- Setup cron job hàng ngày để xóa challenges expired cũ
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-cleanup-old-expired') THEN
    PERFORM cron.unschedule('daily-cleanup-old-expired');
  END IF;
  
  PERFORM cron.schedule(
    'daily-cleanup-old-expired',
    '0 2 * * *', -- Mỗi ngày lúc 2h sáng
    'SELECT public.delete_old_expired_challenges();'
  );
  
  RAISE NOTICE 'Daily old challenge cleanup job scheduled successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule daily cleanup job: %', SQLERRM;
END
$$;

-- Kiểm tra các cron job đã tạo
SELECT 
  jobname,
  schedule,
  command,
  active
FROM cron.job 
WHERE jobname LIKE '%challenge%';
