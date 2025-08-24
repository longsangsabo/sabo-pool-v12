-- =============================================================================
-- STEP 6: TRIGGERS & AUTOMATION SYSTEM (CORRECTED SCHEMA)
-- Deploy này sau Step 5 trên Supabase SQL Editor
-- =============================================================================

-- DROP existing triggers and functions first to avoid conflicts
DROP TRIGGER IF EXISTS trigger_challenge_status_update ON challenges CASCADE;
DROP TRIGGER IF EXISTS trigger_match_completion ON matches CASCADE;
DROP TRIGGER IF EXISTS trigger_spa_transaction_log ON spa_transactions CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_notification_send ON challenges CASCADE;

DROP FUNCTION IF EXISTS handle_challenge_status_change() CASCADE;
DROP FUNCTION IF EXISTS handle_match_completion() CASCADE;
DROP FUNCTION IF EXISTS handle_spa_transaction() CASCADE;
DROP FUNCTION IF EXISTS auto_send_challenge_notification() CASCADE;
DROP FUNCTION IF EXISTS schedule_challenge_cleanup() CASCADE;

-- =============================================================================

-- 1. Trigger Function: Handle Challenge Status Changes
CREATE OR REPLACE FUNCTION handle_challenge_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_result JSONB;
  v_spa_result JSONB;
  v_match_result JSONB;
BEGIN
  -- Log the status change
  RAISE NOTICE 'Challenge % status changed from % to %', NEW.id, OLD.status, NEW.status;

  -- Handle different status transitions
  CASE NEW.status
    WHEN 'accepted' THEN
      -- Send notification to both parties
      SELECT send_challenge_status_notification(NEW.id, 'accepted', NULL) INTO v_notification_result;
      RAISE NOTICE 'Acceptance notification sent: %', v_notification_result;

    WHEN 'club_confirmed' THEN
      -- Challenge approved by club - create match and send notifications
      SELECT send_challenge_status_notification(NEW.id, 'club_confirmed', NEW.club_note) INTO v_notification_result;
      
      -- Auto-create match from approved challenge
      SELECT create_match_from_challenge(NEW.id) INTO v_match_result;
      RAISE NOTICE 'Match created from challenge: %', v_match_result;

    WHEN 'rejected' THEN
      -- Challenge rejected by club - refund SPA if deducted
      SELECT send_challenge_status_notification(NEW.id, 'rejected', NEW.club_note) INTO v_notification_result;
      
      -- Refund SPA points to challenger
      IF NEW.bet_points > 0 THEN
        SELECT reward_challenge_spa(
          NEW.challenger_id, 
          NEW.bet_points, 
          'challenge_refund', 
          'Challenge rejected - SPA refunded'
        ) INTO v_spa_result;
        RAISE NOTICE 'SPA refunded to challenger: %', v_spa_result;
      END IF;

    WHEN 'completed' THEN
      -- Challenge completed - send completion notifications
      SELECT send_challenge_status_notification(NEW.id, 'completed', NULL) INTO v_notification_result;

    WHEN 'cancelled' THEN
      -- Challenge cancelled - refund SPA and notify
      SELECT send_challenge_status_notification(NEW.id, 'cancelled', 'Challenge was cancelled') INTO v_notification_result;
      
      IF NEW.bet_points > 0 THEN
        SELECT reward_challenge_spa(
          NEW.challenger_id, 
          NEW.bet_points, 
          'challenge_refund', 
          'Challenge cancelled - SPA refunded'
        ) INTO v_spa_result;
      END IF;

    WHEN 'expired' THEN
      -- Auto-expire old challenges and refund SPA
      IF NEW.bet_points > 0 THEN
        SELECT reward_challenge_spa(
          NEW.challenger_id, 
          NEW.bet_points, 
          'challenge_refund', 
          'Challenge expired - SPA refunded'
        ) INTO v_spa_result;
      END IF;

    ELSE
      -- Generic status change notification
      SELECT send_challenge_status_notification(NEW.id, NEW.status, NULL) INTO v_notification_result;
  END CASE;

  -- Update the updated_at timestamp
  NEW.updated_at = NOW();

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in challenge status trigger: %', SQLERRM;
    RETURN NEW;  -- Continue with the update even if trigger logic fails
END;
$$;

-- Create trigger for challenge status changes
CREATE TRIGGER trigger_challenge_status_update
  BEFORE UPDATE OF status ON challenges
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_challenge_status_change();

-- =============================================================================

-- 2. Trigger Function: Handle Match Completion
CREATE OR REPLACE FUNCTION handle_match_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_id UUID;
  v_winner_id UUID;
  v_loser_id UUID;
  v_bet_amount INTEGER;
  v_spa_result JSONB;
  v_notification_result JSONB;
BEGIN
  -- Only process when match is completed (has scores and end time)
  IF NEW.score_player1 IS NOT NULL AND NEW.score_player2 IS NOT NULL AND NEW.actual_end_time IS NOT NULL THEN
    
    -- Get related challenge info
    SELECT c.id, c.bet_points
    INTO v_challenge_id, v_bet_amount
    FROM challenges c
    WHERE c.id = NEW.challenge_id;

    -- Determine winner and loser based on scores
    IF NEW.score_player1 > NEW.score_player2 THEN
      v_winner_id := NEW.player1_id;
      v_loser_id := NEW.player2_id;
    ELSIF NEW.score_player2 > NEW.score_player1 THEN
      v_winner_id := NEW.player2_id;
      v_loser_id := NEW.player1_id;
    END IF;

    -- Process SPA rewards for winner (if there's a clear winner and bet amount)
    IF v_winner_id IS NOT NULL AND v_bet_amount > 0 THEN
      -- Winner gets double the bet amount (their bet back + opponent's bet)
      SELECT reward_challenge_spa(
        v_winner_id,
        v_bet_amount * 2,
        'match_win',
        'Match victory reward'
      ) INTO v_spa_result;
      
      RAISE NOTICE 'Winner SPA reward: %', v_spa_result;

      -- Send winner notification
      SELECT send_notification(
        v_winner_id,
        'match_completed',
        'Match Victory!',
        'You won the match and earned ' || (v_bet_amount * 2) || ' SPA points',
        v_challenge_id,
        NEW.id,
        NULL,
        'match',
        'high'
      ) INTO v_notification_result;

      -- Send loser notification
      SELECT send_notification(
        v_loser_id,
        'match_completed',
        'Match Result',
        'Match completed. Better luck next time!',
        v_challenge_id,
        NEW.id,
        NULL,
        'match',
        'medium'
      ) INTO v_notification_result;
    ELSE
      -- No clear winner (draw) or no bet - just notify completion
      SELECT send_notification(
        NEW.player1_id,
        'match_completed',
        'Match Completed',
        'Your match has been completed',
        v_challenge_id,
        NEW.id,
        NULL,
        'match',
        'medium'
      ) INTO v_notification_result;

      SELECT send_notification(
        NEW.player2_id,
        'match_completed',
        'Match Completed', 
        'Your match has been completed',
        v_challenge_id,
        NEW.id,
        NULL,
        'match',
        'medium'
      ) INTO v_notification_result;
    END IF;

    -- Update related challenge status to completed
    IF v_challenge_id IS NOT NULL THEN
      UPDATE challenges 
      SET status = 'completed', updated_at = NOW()
      WHERE id = v_challenge_id;
    END IF;

  END IF;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in match completion trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for match completion
CREATE TRIGGER trigger_match_completion
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (
    OLD.score_player1 IS NULL AND NEW.score_player1 IS NOT NULL
    OR OLD.score_player2 IS NULL AND NEW.score_player2 IS NOT NULL
    OR OLD.actual_end_time IS NULL AND NEW.actual_end_time IS NOT NULL
  )
  EXECUTE FUNCTION handle_match_completion();

-- =============================================================================

-- 3. Trigger Function: Log SPA Transactions
CREATE OR REPLACE FUNCTION handle_spa_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_name TEXT;
  v_balance_after INTEGER;
BEGIN
  -- Get user display name for logging
  SELECT display_name INTO v_user_name
  FROM profiles
  WHERE user_id = NEW.player_id;

  -- Calculate new balance after transaction
  SELECT COALESCE(spa_points, 0) INTO v_balance_after
  FROM profiles
  WHERE user_id = NEW.player_id;

  -- Log significant SPA transactions
  IF NEW.spa_points >= 50 THEN  -- Only log significant transactions
    RAISE NOTICE 'SPA Transaction: % (%) %s % points. New balance: %',
      COALESCE(v_user_name, 'Unknown'),
      NEW.player_id,
      CASE WHEN NEW.spa_points > 0 THEN 'gained' ELSE 'lost' END,
      ABS(NEW.spa_points),
      v_balance_after;

    -- Send notification for large transactions
    IF ABS(NEW.spa_points) >= 100 THEN
      PERFORM send_notification(
        NEW.player_id,
        'spa_transaction',
        CASE WHEN NEW.spa_points > 0 THEN 'SPA Points Earned' ELSE 'SPA Points Deducted' END,
        'You ' || CASE WHEN NEW.spa_points > 0 THEN 'earned' ELSE 'lost' END || 
        ' ' || ABS(NEW.spa_points) || ' SPA points. Source: ' || COALESCE(NEW.source_type, 'system'),
        NULL,
        NULL,
        NULL,
        'spa',
        'medium'
      );
    END IF;
  END IF;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in SPA transaction trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for SPA transaction logging
CREATE TRIGGER trigger_spa_transaction_log
  AFTER INSERT ON spa_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_spa_transaction();

-- =============================================================================

-- 4. Function: Auto-cleanup Expired Challenges
CREATE OR REPLACE FUNCTION schedule_challenge_cleanup()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_cancelled_count INTEGER := 0;
  v_challenge RECORD;
BEGIN
  -- Auto-expire challenges older than 24 hours without acceptance
  FOR v_challenge IN
    SELECT id, challenger_id, bet_points
    FROM challenges
    WHERE status = 'pending'
      AND created_at < NOW() - INTERVAL '24 hours'
  LOOP
    -- Mark as expired
    UPDATE challenges
    SET status = 'expired', updated_at = NOW()
    WHERE id = v_challenge.id;

    -- Refund SPA if bet was placed
    IF v_challenge.bet_points > 0 THEN
      PERFORM reward_challenge_spa(
        v_challenge.challenger_id,
        v_challenge.bet_points,
        'challenge_refund',
        'Challenge expired - SPA refunded'
      );
    END IF;

    v_expired_count := v_expired_count + 1;
  END LOOP;

  -- Auto-cancel challenges older than 7 days in accepted state without club confirmation
  FOR v_challenge IN
    SELECT id, challenger_id, bet_points
    FROM challenges
    WHERE status = 'accepted'
      AND updated_at < NOW() - INTERVAL '7 days'
  LOOP
    -- Mark as cancelled
    UPDATE challenges
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = v_challenge.id;

    -- Refund SPA if bet was placed
    IF v_challenge.bet_points > 0 THEN
      PERFORM reward_challenge_spa(
        v_challenge.challenger_id,
        v_challenge.bet_points,
        'challenge_refund',
        'Challenge auto-cancelled - SPA refunded'
      );
    END IF;

    v_cancelled_count := v_cancelled_count + 1;
  END LOOP;

  -- Clean up old notifications (soft delete)
  PERFORM cleanup_old_notifications(30);

  RETURN jsonb_build_object(
    'success', true,
    'expired_challenges', v_expired_count,
    'cancelled_challenges', v_cancelled_count,
    'cleanup_timestamp', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cleanup error: ' || SQLERRM
    );
END;
$$;

-- =============================================================================

-- 5. Function: Batch Process Pending Club Approvals (Auto-approve trusted users)
CREATE OR REPLACE FUNCTION auto_approve_trusted_challenges()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
  v_approved_count INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Auto-approve challenges from users with high trust score or VIP status
  FOR v_challenge IN
    SELECT c.id, c.challenger_id, p.display_name
    FROM challenges c
    JOIN profiles p ON c.challenger_id = p.user_id
    WHERE c.status = 'accepted'
      AND c.club_confirmed = false
      AND (
        p.spa_points > 500  -- Users with high SPA balance are trusted
        OR p.role = 'admin'  -- Admin users auto-approved
        OR p.is_admin = true  -- Admin flag users auto-approved
        OR (p.verified_rank IS NOT NULL AND LENGTH(p.verified_rank) > 0)  -- Verified rank players auto-approved
      )
      AND c.bet_points <= 100  -- Only auto-approve low-stake challenges
  LOOP
    -- Auto-approve the challenge
    SELECT process_club_approval(
      v_challenge.id,
      NULL,  -- System approval, no specific admin
      true,
      'Auto-approved for trusted user: ' || v_challenge.display_name
    ) INTO v_result;

    IF (v_result->>'success')::boolean THEN
      v_approved_count := v_approved_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'auto_approved_count', v_approved_count,
    'timestamp', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Auto-approval error: ' || SQLERRM
    );
END;
$$;

-- =============================================================================

-- 6. Function: System Health Check for Challenge System
CREATE OR REPLACE FUNCTION challenge_system_health_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pending_challenges INTEGER;
  v_active_matches INTEGER;
  v_unprocessed_notifications INTEGER;
  v_spa_balance_issues INTEGER;
  v_orphaned_matches INTEGER;
BEGIN
  -- Count pending challenges
  SELECT COUNT(*) INTO v_pending_challenges
  FROM challenges
  WHERE status = 'pending' AND created_at > NOW() - INTERVAL '1 day';

  -- Count active matches without completion
  SELECT COUNT(*) INTO v_active_matches
  FROM matches
  WHERE actual_end_time IS NULL AND created_at > NOW() - INTERVAL '7 days';

  -- Count unread notifications older than 1 day
  SELECT COUNT(*) INTO v_unprocessed_notifications
  FROM notifications
  WHERE is_read = false AND created_at < NOW() - INTERVAL '1 day';

  -- Count profiles with negative SPA balance (shouldn't happen)
  SELECT COUNT(*) INTO v_spa_balance_issues
  FROM profiles
  WHERE spa_points < 0;

  -- Count matches without corresponding challenges (orphaned)
  SELECT COUNT(*) INTO v_orphaned_matches
  FROM matches m
  LEFT JOIN challenges c ON m.challenge_id = c.id
  WHERE c.id IS NULL;

  RETURN jsonb_build_object(
    'success', true,
    'health_check', jsonb_build_object(
      'pending_challenges', v_pending_challenges,
      'active_matches', v_active_matches,
      'unprocessed_notifications', v_unprocessed_notifications,
      'spa_balance_issues', v_spa_balance_issues,
      'orphaned_matches', v_orphaned_matches,
      'system_healthy', (
        v_spa_balance_issues = 0 AND
        v_orphaned_matches = 0 AND
        v_unprocessed_notifications < 100
      )
    ),
    'timestamp', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Health check error: ' || SQLERRM
    );
END;
$$;

-- =============================================================================
-- COMMENT: STEP 6 TRIGGERS & AUTOMATION DEPLOYED (CORRECTED SCHEMA)
-- 
-- Triggers đã tạo:
-- 1. trigger_challenge_status_update - Tự động xử lý khi status challenge thay đổi
-- 2. trigger_match_completion - Tự động xử lý khi match hoàn thành
-- 3. trigger_spa_transaction_log - Log và thông báo giao dịch SPA quan trọng
--
-- Functions tự động hóa:
-- 1. handle_challenge_status_change() - Xử lý thay đổi trạng thái challenge
-- 2. handle_match_completion() - Xử lý hoàn thành trận đấu và phân phối SPA
-- 3. handle_spa_transaction() - Log giao dịch SPA
-- 4. schedule_challenge_cleanup() - Dọn dẹp challenge cũ và expired
-- 5. auto_approve_trusted_challenges() - Tự động duyệt challenge từ user tin cậy
-- 6. challenge_system_health_check() - Kiểm tra sức khỏe hệ thống
--
-- Workflow tự động:
-- - Challenge tạo → Chờ accept → Accept → Chờ club confirm → Confirm → Tạo match → Complete → Phân phối SPA
-- - Tự động expire challenge sau 24h không accept
-- - Tự động cancel challenge sau 7 ngày không club confirm  
-- - Tự động approve challenge từ user tin cậy (SPA > 500, VIP, rank > 15)
-- - Tự động thông báo và log các giao dịch SPA quan trọng
-- =============================================================================
