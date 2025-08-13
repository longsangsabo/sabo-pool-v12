-- =====================================================
-- AUTO CLEANUP EXPIRED CHALLENGES SETUP
-- =====================================================

-- Enhanced cleanup function that handles both 'pending' and 'open' challenges
CREATE OR REPLACE FUNCTION public.enhanced_cleanup_expired_challenges()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
  expired_open_count INTEGER;
  total_expired INTEGER;
BEGIN
  -- Cleanup expired 'pending' challenges
  UPDATE public.challenges 
  SET status = 'expired', 
      updated_at = NOW()
  WHERE status = 'pending' 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Cleanup expired 'open' challenges (no opponent after expiry time)
  UPDATE public.challenges 
  SET status = 'expired', 
      updated_at = NOW()
  WHERE status = 'open' 
    AND (
      expires_at < NOW() 
      OR 
      (expires_at IS NULL AND created_at < NOW() - INTERVAL '48 hours')
    );
  
  GET DIAGNOSTICS expired_open_count = ROW_COUNT;
  
  total_expired := expired_count + expired_open_count;
  
  -- Log cleanup results
  IF total_expired > 0 THEN
    INSERT INTO public.system_logs (log_type, message, metadata)
    VALUES (
      'challenge_cleanup',
      FORMAT('Auto-expired %s challenges (%s pending, %s open)', 
             total_expired, expired_count, expired_open_count),
      jsonb_build_object(
        'expired_pending', expired_count,
        'expired_open', expired_open_count,
        'total_expired', total_expired,
        'cleanup_time', NOW()
      )
    );
    
    -- Send notifications to affected users
    INSERT INTO public.notifications (user_id, title, message, type, metadata)
    SELECT 
      challenger_id,
      'Thách đấu đã hết hạn',
      CASE 
        WHEN status = 'expired' AND opponent_id IS NULL THEN 
          'Thách đấu mở của bạn đã hết hạn do không có người tham gia'
        ELSE 
          'Thách đấu của bạn đã hết hạn do không được phản hồi'
      END,
      'challenge_expired',
      jsonb_build_object('challenge_id', id, 'cleanup_type', 'auto_expired')
    FROM public.challenges 
    WHERE status = 'expired' 
      AND updated_at > NOW() - INTERVAL '1 minute';
  END IF;
  
  RETURN total_expired;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create enhanced cleanup function that also removes very old expired challenges
CREATE OR REPLACE FUNCTION public.deep_cleanup_challenges()
RETURNS INTEGER AS $$
DECLARE
  removed_count INTEGER;
BEGIN
  -- Remove challenges that have been expired for more than 30 days
  DELETE FROM public.challenges 
  WHERE status = 'expired' 
    AND updated_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS removed_count = ROW_COUNT;
  
  -- Log deep cleanup
  IF removed_count > 0 THEN
    INSERT INTO public.system_logs (log_type, message, metadata)
    VALUES (
      'deep_challenge_cleanup',
      FORMAT('Permanently removed %s old expired challenges', removed_count),
      jsonb_build_object(
        'removed_count', removed_count,
        'cleanup_time', NOW()
      )
    );
  END IF;
  
  RETURN removed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up cron jobs for automatic cleanup
-- Note: This requires pg_cron extension to be enabled

-- Hourly cleanup of expired challenges
SELECT cron.schedule(
  'hourly-enhanced-challenge-cleanup',
  '0 * * * *', -- Every hour at minute 0
  'SELECT public.enhanced_cleanup_expired_challenges();'
);

-- Daily deep cleanup (remove old expired challenges)
SELECT cron.schedule(
  'daily-deep-challenge-cleanup',
  '0 2 * * *', -- Every day at 2 AM
  'SELECT public.deep_cleanup_challenges();'
);

-- Test the functions (run manually)
-- SELECT public.enhanced_cleanup_expired_challenges();
-- SELECT public.deep_cleanup_challenges();

-- Check scheduled jobs
-- SELECT * FROM cron.job WHERE jobname LIKE '%challenge%';

-- To unschedule if needed:
-- SELECT cron.unschedule('hourly-enhanced-challenge-cleanup');
-- SELECT cron.unschedule('daily-deep-challenge-cleanup');
