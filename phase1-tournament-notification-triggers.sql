-- ============================================================================
-- PHASE 1: TOURNAMENT NOTIFICATION SYSTEM
-- Purpose: Complete tournament lifecycle notifications from registration to completion
-- Timeline: Week 1-2 of notification system master plan
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TOURNAMENT REGISTRATION NOTIFICATION SYSTEM
-- ============================================================================

-- Function to handle tournament registration notifications
CREATE OR REPLACE FUNCTION notify_tournament_registration()
RETURNS TRIGGER AS $$
DECLARE
  tournament_info RECORD;
  organizer_info RECORD;
  player_info RECORD;
  registration_count INTEGER;
BEGIN
  -- Get tournament details
  SELECT 
    t.name, 
    t.start_date, 
    t.entry_fee,
    t.max_participants,
    cp.user_id as organizer_id, 
    cp.club_name,
    cp.id as club_id
  INTO tournament_info 
  FROM tournaments t
  JOIN club_profiles cp ON t.club_id = cp.id
  WHERE t.id = NEW.tournament_id;
  
  -- Get player details
  SELECT full_name, spa_rank 
  INTO player_info
  FROM profiles 
  WHERE user_id = NEW.player_id;
  
  -- Get current registration count
  SELECT COUNT(*) 
  INTO registration_count
  FROM tournament_registrations 
  WHERE tournament_id = NEW.tournament_id;
  
  -- ========================================
  -- NOTIFY PLAYER: Registration confirmed
  -- ========================================
  PERFORM create_challenge_notification(
    'tournament_registration_confirmed',
    NEW.player_id,
    '🏆 Đăng ký giải đấu thành công',
    format('Bạn đã đăng ký thành công giải đấu "%s" tại %s. Khởi tranh: %s. Phí: %s VND',
           tournament_info.name, 
           tournament_info.club_name,
           to_char(tournament_info.start_date, 'DD/MM/YYYY HH24:MI'),
           COALESCE(tournament_info.entry_fee::TEXT, 'Miễn phí')),
    NEW.tournament_id::TEXT,
    'trophy',
    'medium',
    'Xem chi tiết',
    '/tournaments/' || NEW.tournament_id
  );
  
  -- ========================================
  -- NOTIFY ORGANIZER: New registration
  -- ========================================
  PERFORM create_challenge_notification(
    'new_tournament_registration',
    tournament_info.organizer_id,
    '👥 Đăng ký mới cho giải đấu',
    format('%s (Rank %s) đã đăng ký giải đấu "%s". Tổng: %s/%s người',
           COALESCE(player_info.full_name, 'Người chơi'),
           COALESCE(player_info.spa_rank, 'Chưa xác định'),
           tournament_info.name,
           registration_count,
           COALESCE(tournament_info.max_participants::TEXT, '∞')),
    NEW.tournament_id::TEXT,
    'users',
    'low',
    'Quản lý',
    '/tournaments/' || NEW.tournament_id || '/manage'
  );
  
  -- ========================================
  -- NOTIFY IF TOURNAMENT IS GETTING FULL
  -- ========================================
  IF tournament_info.max_participants IS NOT NULL 
     AND registration_count >= (tournament_info.max_participants * 0.8) THEN
    PERFORM create_challenge_notification(
      'tournament_almost_full',
      tournament_info.organizer_id,
      '⚠️ Giải đấu sắp đầy',
      format('Giải đấu "%s" đã có %s/%s người đăng ký (80%%). Hãy chuẩn bị đóng đăng ký!',
             tournament_info.name,
             registration_count,
             tournament_info.max_participants),
      NEW.tournament_id::TEXT,
      'alert-triangle',
      'medium',
      'Quản lý',
      '/tournaments/' || NEW.tournament_id || '/manage'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. PAYMENT CONFIRMATION NOTIFICATION SYSTEM
-- ============================================================================

-- Function to handle payment workflow notifications
CREATE OR REPLACE FUNCTION notify_payment_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  tournament_info RECORD;
  player_info RECORD;
  organizer_info RECORD;
BEGIN
  -- Only proceed if payment status actually changed
  IF OLD.payment_status = NEW.payment_status THEN
    RETURN NEW;
  END IF;
  
  -- Get tournament and player details
  SELECT 
    t.name, 
    t.start_date,
    t.entry_fee,
    cp.user_id as organizer_id,
    cp.club_name
  INTO tournament_info 
  FROM tournaments t
  JOIN club_profiles cp ON t.club_id = cp.id
  WHERE t.id = NEW.tournament_id;
  
  SELECT full_name 
  INTO player_info
  FROM profiles 
  WHERE user_id = NEW.player_id;
  
  -- ========================================
  -- PAYMENT CONFIRMED
  -- ========================================
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    -- Notify player
    PERFORM create_challenge_notification(
      'payment_confirmed',
      NEW.player_id,
      '💳 Thanh toán được xác nhận',
      format('Thanh toán %s VND cho giải đấu "%s" đã được xác nhận. Bạn đã chính thức tham gia!',
             tournament_info.entry_fee,
             tournament_info.name),
      NEW.tournament_id::TEXT,
      'credit-card',
      'high',
      'Xem giải đấu',
      '/tournaments/' || NEW.tournament_id
    );
    
    -- Notify organizer
    PERFORM create_challenge_notification(
      'payment_received',
      tournament_info.organizer_id,
      '💰 Nhận thanh toán',
      format('%s đã thanh toán %s VND cho giải đấu "%s"',
             COALESCE(player_info.full_name, 'Người chơi'),
             tournament_info.entry_fee,
             tournament_info.name),
      NEW.tournament_id::TEXT,
      'dollar-sign',
      'low',
      'Xem thanh toán',
      '/tournaments/' || NEW.tournament_id || '/payments'
    );
  END IF;
  
  -- ========================================
  -- PAYMENT REJECTED
  -- ========================================
  IF NEW.payment_status = 'rejected' AND OLD.payment_status != 'rejected' THEN
    PERFORM create_challenge_notification(
      'payment_rejected',
      NEW.player_id,
      '❌ Thanh toán bị từ chối',
      format('Thanh toán cho giải đấu "%s" bị từ chối. Lý do: %s. Vui lòng liên hệ BTC.',
             tournament_info.name,
             COALESCE(NEW.admin_notes, 'Không rõ lý do')),
      NEW.tournament_id::TEXT,
      'x-circle',
      'urgent',
      'Liên hệ BTC',
      '/tournaments/' || NEW.tournament_id || '/contact'
    );
  END IF;
  
  -- ========================================
  -- PAYMENT PENDING REMINDER (after 24h)
  -- ========================================
  IF NEW.payment_status = 'pending' 
     AND NEW.registration_date < NOW() - INTERVAL '24 hours'
     AND (OLD.payment_status IS NULL OR OLD.payment_status != 'pending') THEN
    PERFORM create_challenge_notification(
      'payment_reminder',
      NEW.player_id,
      '⏰ Nhắc nhở thanh toán',
      format('Bạn chưa thanh toán cho giải đấu "%s". Vui lòng thanh toán trong 48h để giữ chỗ.',
             tournament_info.name),
      NEW.tournament_id::TEXT,
      'clock',
      'medium',
      'Thanh toán ngay',
      '/tournaments/' || NEW.tournament_id || '/payment'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. TOURNAMENT LIFECYCLE NOTIFICATION SYSTEM
-- ============================================================================

-- Function to handle tournament status changes and lifecycle events
CREATE OR REPLACE FUNCTION notify_tournament_lifecycle()
RETURNS TRIGGER AS $$
DECLARE
  participant_record RECORD;
  organizer_info RECORD;
  participant_count INTEGER;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get organizer info
  SELECT cp.user_id as organizer_id, cp.club_name
  INTO organizer_info
  FROM club_profiles cp
  WHERE cp.id = NEW.club_id;
  
  -- Get participant count
  SELECT COUNT(*) 
  INTO participant_count
  FROM tournament_registrations tr
  WHERE tr.tournament_id = NEW.id 
  AND tr.payment_status = 'paid';
  
  -- ========================================
  -- TOURNAMENT STARTED / BRACKET RELEASED
  -- ========================================
  IF NEW.status = 'active' AND OLD.status = 'open' THEN
    -- Notify all participants
    FOR participant_record IN
      SELECT tr.player_id
      FROM tournament_registrations tr
      WHERE tr.tournament_id = NEW.id 
      AND tr.payment_status = 'paid'
    LOOP
      PERFORM create_challenge_notification(
        'bracket_released',
        participant_record.player_id,
        '📋 Bảng đấu đã được công bố',
        format('Bảng đấu cho giải đấu "%s" đã sẵn sàng! Xem lịch thi đấu và chuẩn bị cho trận đầu tiên.',
               NEW.name),
        NEW.id::TEXT,
        'calendar',
        'high',
        'Xem bảng đấu',
        '/tournaments/' || NEW.id || '/bracket'
      );
    END LOOP;
    
    -- Notify organizer
    PERFORM create_challenge_notification(
      'tournament_started',
      organizer_info.organizer_id,
      '🏁 Giải đấu bắt đầu',
      format('Giải đấu "%s" đã chính thức bắt đầu với %s người tham gia!',
             NEW.name, participant_count),
      NEW.id::TEXT,
      'play-circle',
      'high',
      'Quản lý giải',
      '/tournaments/' || NEW.id || '/manage'
    );
  END IF;
  
  -- ========================================
  -- TOURNAMENT COMPLETED
  -- ========================================
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Notify all participants
    FOR participant_record IN
      SELECT tr.player_id
      FROM tournament_registrations tr
      WHERE tr.tournament_id = NEW.id
    LOOP
      PERFORM create_challenge_notification(
        'tournament_completed',
        participant_record.player_id,
        '🏅 Giải đấu kết thúc',
        format('Giải đấu "%s" đã kết thúc! Xem kết quả và bảng xếp hạng cuối cùng.',
               NEW.name),
        NEW.id::TEXT,
        'trophy',
        'medium',
        'Xem kết quả',
        '/tournaments/' || NEW.id || '/results'
      );
    END LOOP;
  END IF;
  
  -- ========================================
  -- REGISTRATION CLOSING SOON
  -- ========================================
  IF NEW.registration_end IS NOT NULL 
     AND NEW.registration_end > NOW() 
     AND NEW.registration_end <= NOW() + INTERVAL '24 hours'
     AND NEW.status = 'open' THEN
    
    -- Notify interested users (this could be expanded to track user interests)
    PERFORM create_challenge_notification(
      'registration_closing_soon',
      organizer_info.organizer_id,
      '⏰ Đăng ký sắp đóng',
      format('Đăng ký cho giải đấu "%s" sẽ đóng trong 24h. Hiện có %s người đăng ký.',
             NEW.name, participant_count),
      NEW.id::TEXT,
      'clock',
      'medium',
      'Xem đăng ký',
      '/tournaments/' || NEW.id || '/registrations'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. TOURNAMENT MATCH SCHEDULING NOTIFICATIONS
-- ============================================================================

-- Function to notify players about scheduled matches
CREATE OR REPLACE FUNCTION notify_match_scheduled()
RETURNS TRIGGER AS $$
DECLARE
  tournament_info RECORD;
  player1_info RECORD;
  player2_info RECORD;
BEGIN
  -- Only proceed for new matches or when scheduled_time changes
  IF TG_OP = 'UPDATE' AND OLD.scheduled_time = NEW.scheduled_time THEN
    RETURN NEW;
  END IF;
  
  -- Skip if no scheduled time
  IF NEW.scheduled_time IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get tournament info
  SELECT name, start_date
  INTO tournament_info
  FROM tournaments
  WHERE id = NEW.tournament_id;
  
  -- Get player info
  SELECT full_name INTO player1_info
  FROM profiles WHERE user_id = NEW.player1_id;
  
  SELECT full_name INTO player2_info  
  FROM profiles WHERE user_id = NEW.player2_id;
  
  -- ========================================
  -- NOTIFY PLAYER 1
  -- ========================================
  PERFORM create_challenge_notification(
    'match_scheduled',
    NEW.player1_id,
    '📅 Lịch thi đấu mới',
    format('Trận đấu của bạn với %s trong giải "%s" được lên lịch vào %s',
           COALESCE(player2_info.full_name, 'đối thủ'),
           tournament_info.name,
           to_char(NEW.scheduled_time, 'DD/MM/YYYY HH24:MI')),
    NEW.tournament_id::TEXT,
    'calendar',
    'medium',
    'Xem chi tiết',
    '/tournaments/' || NEW.tournament_id || '/matches/' || NEW.id
  );
  
  -- ========================================
  -- NOTIFY PLAYER 2  
  -- ========================================
  PERFORM create_challenge_notification(
    'match_scheduled',
    NEW.player2_id,
    '📅 Lịch thi đấu mới',
    format('Trận đấu của bạn với %s trong giải "%s" được lên lịch vào %s',
           COALESCE(player1_info.full_name, 'đối thủ'),
           tournament_info.name,
           to_char(NEW.scheduled_time, 'DD/MM/YYYY HH24:MI')),
    NEW.tournament_id::TEXT,
    'calendar',
    'medium',
    'Xem chi tiết',
    '/tournaments/' || NEW.tournament_id || '/matches/' || NEW.id
  );
  
  -- ========================================
  -- SCHEDULE REMINDER NOTIFICATIONS (1 hour before)
  -- ========================================
  IF NEW.scheduled_time > NOW() + INTERVAL '1 hour' THEN
    -- This would need a scheduler/cron job to execute
    -- For now, we'll create a note for future implementation
    INSERT INTO scheduled_notifications (
      notification_type,
      target_user_id,
      execute_at,
      tournament_id,
      match_id,
      title,
      message,
      priority
    ) VALUES 
    (
      'match_reminder_1h',
      NEW.player1_id,
      NEW.scheduled_time - INTERVAL '1 hour',
      NEW.tournament_id,
      NEW.id,
      '⏰ Trận đấu trong 1 giờ',
      format('Trận đấu với %s sẽ bắt đầu trong 1 giờ nữa!', 
             COALESCE(player2_info.full_name, 'đối thủ')),
      'urgent'
    ),
    (
      'match_reminder_1h',
      NEW.player2_id,
      NEW.scheduled_time - INTERVAL '1 hour',
      NEW.tournament_id,
      NEW.id,
      '⏰ Trận đấu trong 1 giờ',
      format('Trận đấu với %s sẽ bắt đầu trong 1 giờ nữa!', 
             COALESCE(player1_info.full_name, 'đối thủ')),
      'urgent'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. CREATE TRIGGERS FOR TOURNAMENT NOTIFICATION SYSTEM
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS tournament_registration_notification_trigger ON tournament_registrations;
DROP TRIGGER IF EXISTS payment_confirmation_notification_trigger ON tournament_registrations;
DROP TRIGGER IF EXISTS tournament_lifecycle_notification_trigger ON tournaments;
DROP TRIGGER IF EXISTS match_scheduling_notification_trigger ON tournament_matches;

-- Create tournament registration trigger
CREATE TRIGGER tournament_registration_notification_trigger
    AFTER INSERT ON tournament_registrations
    FOR EACH ROW
    EXECUTE FUNCTION notify_tournament_registration();

-- Create payment confirmation trigger
CREATE TRIGGER payment_confirmation_notification_trigger
    AFTER UPDATE ON tournament_registrations
    FOR EACH ROW
    EXECUTE FUNCTION notify_payment_confirmation();

-- Create tournament lifecycle trigger
CREATE TRIGGER tournament_lifecycle_notification_trigger
    AFTER UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION notify_tournament_lifecycle();

-- Create match scheduling trigger
CREATE TRIGGER match_scheduling_notification_trigger
    AFTER INSERT OR UPDATE ON tournament_matches
    FOR EACH ROW
    EXECUTE FUNCTION notify_match_scheduled();

-- ============================================================================
-- 6. CREATE SCHEDULED NOTIFICATIONS TABLE (for future cron jobs)
-- ============================================================================

-- Table to store scheduled notifications that need to be sent later
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type TEXT NOT NULL,
    target_user_id UUID NOT NULL REFERENCES auth.users(id),
    execute_at TIMESTAMPTZ NOT NULL,
    executed BOOLEAN DEFAULT FALSE,
    tournament_id UUID REFERENCES tournaments(id),
    match_id UUID,
    challenge_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ
);

-- Index for efficient querying of pending notifications
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_execute 
ON scheduled_notifications (execute_at, executed) 
WHERE executed = FALSE;

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION notify_tournament_registration() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_payment_confirmation() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_tournament_lifecycle() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_match_scheduled() TO authenticated;

-- Grant permissions on scheduled_notifications table
GRANT SELECT, INSERT, UPDATE ON scheduled_notifications TO authenticated;

-- ============================================================================
-- 8. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION notify_tournament_registration() IS 'Sends notifications when users register for tournaments';
COMMENT ON FUNCTION notify_payment_confirmation() IS 'Handles payment workflow notifications for tournament registration';
COMMENT ON FUNCTION notify_tournament_lifecycle() IS 'Manages notifications for tournament status changes';
COMMENT ON FUNCTION notify_match_scheduled() IS 'Notifies players when tournament matches are scheduled';
COMMENT ON TABLE scheduled_notifications IS 'Stores notifications to be sent at specific times via cron jobs';

-- ============================================================================
-- 9. VERIFICATION QUERIES
-- ============================================================================

-- Check if all triggers were created successfully
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    trigger_schema
FROM information_schema.triggers
WHERE trigger_name LIKE '%tournament%notification%'
ORDER BY trigger_name;

-- Check if functions exist
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines
WHERE routine_name LIKE '%tournament%'
AND routine_name LIKE '%notify%'
ORDER BY routine_name;

-- ============================================================================
-- PHASE 1 TOURNAMENT NOTIFICATION SYSTEM IMPLEMENTATION COMPLETE!
-- 
-- What this provides:
-- ✅ Tournament registration confirmations
-- ✅ Payment workflow notifications  
-- ✅ Tournament lifecycle management
-- ✅ Match scheduling notifications
-- ✅ Scheduled notification framework
-- ✅ Complete automation of tournament communication
--
-- Next: Test the system and prepare for Phase 2 (Club Management)
-- ============================================================================
