-- =====================================================
-- SCRIPT KIỂM TRA VÀ QUẢN LÝ THÁCH ĐẤU HẾT HẠN
-- Các câu lệnh hữu ích để kiểm tra và quản lý
-- =====================================================

-- 1. XEM TẤT CẢ THÁCH ĐẤU THEO STATUS
SELECT 
  status,
  COUNT(*) as total,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
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

-- 2. XEM THÁCH ĐẤU SẮP HẾT HẠN (trong 2 giờ tới)
SELECT 
  id,
  challenger_id,
  opponent_id,
  status,
  expires_at,
  created_at,
  CASE 
    WHEN expires_at IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (expires_at - NOW()))/3600 
    ELSE 
      EXTRACT(EPOCH FROM (created_at + INTERVAL '48 hours' - NOW()))/3600
  END as hours_until_expiry
FROM public.challenges 
WHERE status IN ('pending', 'open')
  AND (
    (expires_at IS NOT NULL AND expires_at < NOW() + INTERVAL '2 hours') 
    OR 
    (expires_at IS NULL AND created_at < NOW() - INTERVAL '46 hours')
  )
ORDER BY 
  CASE 
    WHEN expires_at IS NOT NULL THEN expires_at 
    ELSE created_at + INTERVAL '48 hours'
  END;

-- 3. XEM THÁCH ĐẤU ĐÃ HẾT HẠN NHƯNG CHƯA BỊ EXPIRED
SELECT 
  id,
  challenger_id,
  opponent_id,
  status,
  expires_at,
  created_at,
  NOW() - COALESCE(expires_at, created_at + INTERVAL '48 hours') as overdue_by
FROM public.challenges 
WHERE status IN ('pending', 'open')
  AND (
    (expires_at IS NOT NULL AND expires_at < NOW()) 
    OR 
    (expires_at IS NULL AND created_at < NOW() - INTERVAL '48 hours')
  )
ORDER BY overdue_by DESC;

-- 4. CHẠY MANUAL CLEANUP (chỉ cập nhật status, không xóa)
-- Uncomment dòng dưới để chạy:
-- SELECT public.auto_cleanup_expired_challenges();

-- 5. XÓA VĨNH VIỄN THÁCH ĐẤU EXPIRED CŨ (cẩn thận!)
-- Uncomment dòng dưới để chạy (chỉ xóa những expired > 30 ngày):
-- SELECT public.delete_old_expired_challenges();

-- 6. KIỂM TRA CRON JOBS
SELECT 
  jobname,
  schedule,
  command,
  active,
  database
FROM cron.job 
WHERE command LIKE '%challenge%' OR jobname LIKE '%challenge%';

-- 7. XEM LỊCH SỬ CHẠY CRON JOB (nếu có logging)
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE command LIKE '%challenge%'
ORDER BY start_time DESC
LIMIT 10;

-- 8. TẠM DỪNG/KÍCH HOẠT CRON JOB
-- Uncomment để tạm dừng:
-- SELECT cron.unschedule('hourly-challenge-cleanup');

-- Uncomment để kích hoạt lại:
-- SELECT cron.schedule('hourly-challenge-cleanup', '0 * * * *', 'SELECT public.auto_cleanup_expired_challenges();');

-- 9. THỐNG KÊ THÁCH ĐẤU THEO THỜI GIAN
SELECT 
  DATE(created_at) as date,
  status,
  COUNT(*) as count
FROM public.challenges 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), status
ORDER BY date DESC, status;
