-- ============================================================================
-- PHASE 2: CLUB MANAGEMENT NOTIFICATION SYSTEM  
-- Purpose: Automate club operations with comprehensive notification workflows
-- Timeline: Week 3-4 of notification system master plan
-- ============================================================================

-- ============================================================================
-- 1. CLUB MEMBERSHIP MANAGEMENT NOTIFICATIONS
-- ============================================================================

-- Function to handle club membership request notifications
CREATE OR REPLACE FUNCTION notify_club_membership()
RETURNS TRIGGER AS $$
DECLARE
  club_info RECORD;
  applicant_info RECORD;
  admin_record RECORD;
BEGIN
  -- Get club details
  SELECT 
    cp.club_name, 
    cp.user_id as owner_id,
    cp.id as club_id
  INTO club_info
  FROM club_profiles cp
  WHERE cp.id = NEW.club_id;
  
  -- Get applicant details
  SELECT 
    p.full_name, 
    p.spa_rank,
    pr.spa_points,
    pr.elo_points
  INTO applicant_info  
  FROM profiles p
  LEFT JOIN player_rankings pr ON p.user_id = pr.player_id
  WHERE p.user_id = NEW.user_id;
  
  -- ========================================
  -- NEW MEMBERSHIP REQUEST
  -- ========================================
  IF TG_OP = 'INSERT' THEN
    -- Notify club owner
    PERFORM create_challenge_notification(
      'membership_request',
      club_info.owner_id,
      '📝 Yêu cầu gia nhập club',
      format('%s (Rank %s, %s SPA) muốn gia nhập club %s. Lý do: %s',
             COALESCE(applicant_info.full_name, 'Người chơi'),
             COALESCE(applicant_info.spa_rank, 'Chưa xác định'),
             COALESCE(applicant_info.spa_points::TEXT, '0'),
             club_info.club_name,
             COALESCE(NEW.reason, 'Không có lý do')),
      NEW.club_id::TEXT,
      'user-plus',
      'medium',
      'Xem yêu cầu',
      '/clubs/' || NEW.club_id || '/members/pending'
    );
    
    -- Notify all club admins
    FOR admin_record IN
      SELECT cm.user_id
      FROM club_members cm
      WHERE cm.club_id = NEW.club_id
      AND cm.role IN ('admin', 'moderator')
      AND cm.user_id != club_info.owner_id
    LOOP
      PERFORM create_challenge_notification(
        'membership_request_admin',
        admin_record.user_id,
        '📝 Yêu cầu thành viên mới',
        format('%s muốn gia nhập club %s',
               COALESCE(applicant_info.full_name, 'Người chơi'),
               club_info.club_name),
        NEW.club_id::TEXT,
        'users',
        'low',
        'Xem yêu cầu',
        '/clubs/' || NEW.club_id || '/members/pending'
      );
    END LOOP;
    
    -- Confirm to applicant
    PERFORM create_challenge_notification(
      'membership_request_sent',
      NEW.user_id,
      '📤 Đã gửi yêu cầu gia nhập',
      format('Yêu cầu gia nhập club %s đã được gửi. Chúng tôi sẽ phản hồi trong 24-48h.',
             club_info.club_name),
      NEW.club_id::TEXT,
      'send',
      'low',
      'Xem club',
      '/clubs/' || NEW.club_id
    );
  END IF;
  
  -- ========================================
  -- MEMBERSHIP STATUS CHANGES
  -- ========================================
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Membership approved
    IF NEW.status = 'approved' THEN
      PERFORM create_challenge_notification(
        'membership_approved',
        NEW.user_id,
        '✅ Được chấp nhận vào club',
        format('Chúc mừng! Bạn đã được chấp nhận tham gia club %s. Chào mừng bạn đến với gia đình!',
               club_info.club_name),
        NEW.club_id::TEXT,
        'check-circle',
        'high',
        'Xem club',
        '/clubs/' || NEW.club_id
      );
      
      -- Notify club owner about new member
      PERFORM create_challenge_notification(
        'new_member_joined',
        club_info.owner_id,
        '🎉 Thành viên mới',
        format('%s đã chính thức gia nhập club %s!',
               COALESCE(applicant_info.full_name, 'Thành viên mới'),
               club_info.club_name),
        NEW.club_id::TEXT,
        'user-check',
        'low',
        'Xem thành viên',
        '/clubs/' || NEW.club_id || '/members'
      );
    END IF;
    
    -- Membership declined
    IF NEW.status = 'declined' THEN
      PERFORM create_challenge_notification(
        'membership_declined',
        NEW.user_id,
        '❌ Yêu cầu bị từ chối',
        format('Rất tiếc, yêu cầu gia nhập club %s bị từ chối. Lý do: %s',
               club_info.club_name,
               COALESCE(NEW.admin_notes, 'Không phù hợp với yêu cầu club')),
        NEW.club_id::TEXT,
        'x-circle',
        'medium',
        'Tìm club khác',
        '/clubs'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. RANK VERIFICATION NOTIFICATION SYSTEM
-- ============================================================================

-- Function to handle rank verification workflow
CREATE OR REPLACE FUNCTION notify_rank_verification()
RETURNS TRIGGER AS $$
DECLARE
  club_info RECORD;
  player_info RECORD;
  admin_record RECORD;
BEGIN
  -- Get club and player details
  SELECT cp.club_name, cp.user_id as owner_id
  INTO club_info
  FROM club_profiles cp
  WHERE cp.id = NEW.club_id;
  
  SELECT p.full_name, p.spa_rank
  INTO player_info
  FROM profiles p
  WHERE p.user_id = NEW.player_id;
  
  -- ========================================
  -- NEW RANK VERIFICATION REQUEST
  -- ========================================
  IF TG_OP = 'INSERT' THEN
    -- Notify club admins
    FOR admin_record IN
      SELECT cm.user_id
      FROM club_members cm
      WHERE cm.club_id = NEW.club_id
      AND cm.role IN ('admin', 'owner', 'moderator')
    LOOP
      PERFORM create_challenge_notification(
        'rank_verification_request',
        admin_record.user_id,
        '📊 Yêu cầu xác minh rank',
        format('%s yêu cầu xác minh rank %s. Rank hiện tại: %s',
               COALESCE(player_info.full_name, 'Thành viên'),
               NEW.claimed_rank,
               COALESCE(player_info.spa_rank, 'Chưa có')),
        NEW.club_id::TEXT,
        'badge-check',
        'medium',
        'Xác minh ngay',
        '/clubs/' || NEW.club_id || '/rank-verification/' || NEW.id
      );
    END LOOP;
    
    -- Confirm to player
    PERFORM create_challenge_notification(
      'rank_verification_submitted',
      NEW.player_id,
      '📤 Đã gửi yêu cầu xác minh',
      format('Yêu cầu xác minh rank %s đã được gửi đến club %s. Kết quả sẽ có trong 24-48h.',
             NEW.claimed_rank,
             club_info.club_name),
      NEW.club_id::TEXT,
      'upload',
      'low',
      'Theo dõi',
      '/profile/rank-verification'
    );
  END IF;
  
  -- ========================================
  -- RANK VERIFICATION STATUS CHANGES
  -- ========================================
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Verification approved
    IF NEW.status = 'approved' THEN
      PERFORM create_challenge_notification(
        'rank_verification_approved',
        NEW.player_id,
        '✅ Rank được xác minh',
        format('Rank %s của bạn đã được club %s xác minh thành công! Rank profile đã được cập nhật.',
               NEW.claimed_rank,
               club_info.club_name),
        NEW.club_id::TEXT,
        'badge-check',
        'high',
        'Xem profile',
        '/profile'
      );
      
      -- Notify club about successful verification
      PERFORM create_challenge_notification(
        'rank_verified_success',
        club_info.owner_id,
        '✅ Xác minh rank thành công',
        format('Rank %s của %s đã được xác minh và cập nhật thành công.',
               NEW.claimed_rank,
               COALESCE(player_info.full_name, 'thành viên')),
        NEW.club_id::TEXT,
        'check-circle',
        'low',
        'Xem thành viên',
        '/clubs/' || NEW.club_id || '/members'
      );
    END IF;
    
    -- Verification rejected
    IF NEW.status = 'rejected' THEN
      PERFORM create_challenge_notification(
        'rank_verification_rejected',
        NEW.player_id,
        '❌ Xác minh rank bị từ chối',
        format('Yêu cầu xác minh rank %s bị từ chối. Lý do: %s. Bạn có thể gửi lại yêu cầu với bằng chứng đầy đủ hơn.',
               NEW.claimed_rank,
               COALESCE(NEW.admin_notes, 'Bằng chứng không đủ thuyết phục')),
        NEW.club_id::TEXT,
        'x-circle',
        'medium',
        'Gửi lại',
        '/clubs/' || NEW.club_id || '/rank-verification'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. CLUB ROLE MANAGEMENT NOTIFICATIONS
-- ============================================================================

-- Function to handle club role changes
CREATE OR REPLACE FUNCTION notify_role_changes()
RETURNS TRIGGER AS $$
DECLARE
  club_info RECORD;
  member_info RECORD;
  changed_by_info RECORD;
BEGIN
  -- Only proceed if role actually changed
  IF TG_OP = 'UPDATE' AND OLD.role = NEW.role THEN
    RETURN NEW;
  END IF;
  
  -- Get club, member, and admin details
  SELECT cp.club_name, cp.user_id as owner_id
  INTO club_info
  FROM club_profiles cp
  WHERE cp.id = NEW.club_id;
  
  SELECT p.full_name
  INTO member_info
  FROM profiles p
  WHERE p.user_id = NEW.user_id;
  
  SELECT p.full_name as admin_name
  INTO changed_by_info
  FROM profiles p
  WHERE p.user_id = COALESCE(NEW.updated_by, NEW.created_by);
  
  -- ========================================
  -- ROLE PROMOTION
  -- ========================================
  IF NEW.role IN ('admin', 'moderator') AND OLD.role = 'member' THEN
    -- Notify the promoted member
    PERFORM create_challenge_notification(
      'role_promoted',
      NEW.user_id,
      '🔄 Thăng chức trong club',
      format('Bạn đã được thăng chức thành %s của club %s bởi %s. Chúc mừng!',
             CASE NEW.role 
               WHEN 'admin' THEN 'quản trị viên'
               WHEN 'moderator' THEN 'điều hành viên'
               ELSE NEW.role
             END,
             club_info.club_name,
             COALESCE(changed_by_info.admin_name, 'quản lý club')),
      NEW.club_id::TEXT,
      'trending-up',
      'high',
      'Xem quyền hạn',
      '/clubs/' || NEW.club_id || '/admin'
    );
    
    -- Notify club owner
    IF NEW.user_id != club_info.owner_id THEN
      PERFORM create_challenge_notification(
        'member_promoted',
        club_info.owner_id,
        '👨‍💼 Thành viên được thăng chức',
        format('%s đã được thăng chức thành %s',
               COALESCE(member_info.full_name, 'Thành viên'),
               NEW.role),
        NEW.club_id::TEXT,
        'user-check',
        'low',
        'Quản lý team',
        '/clubs/' || NEW.club_id || '/members'
      );
    END IF;
  END IF;
  
  -- ========================================
  -- ROLE DEMOTION
  -- ========================================
  IF NEW.role = 'member' AND OLD.role IN ('admin', 'moderator') THEN
    -- Notify the demoted member
    PERFORM create_challenge_notification(
      'role_demoted',
      NEW.user_id,
      '🔄 Thay đổi vai trò',
      format('Vai trò của bạn trong club %s đã được thay đổi thành thành viên thông thường.',
             club_info.club_name),
      NEW.club_id::TEXT,
      'trending-down',
      'medium',
      'Xem club',
      '/clubs/' || NEW.club_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CLUB ANNOUNCEMENT SYSTEM
-- ============================================================================

-- Function to handle club announcements
CREATE OR REPLACE FUNCTION notify_club_announcements()
RETURNS TRIGGER AS $$
DECLARE
  club_info RECORD;
  member_record RECORD;
  author_info RECORD;
BEGIN
  -- Get club and author details
  SELECT cp.club_name, cp.user_id as owner_id
  INTO club_info
  FROM club_profiles cp
  WHERE cp.id = NEW.club_id;
  
  SELECT p.full_name
  INTO author_info
  FROM profiles p
  WHERE p.user_id = NEW.created_by;
  
  -- ========================================
  -- NEW CLUB ANNOUNCEMENT
  -- ========================================
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    -- Notify all club members
    FOR member_record IN
      SELECT cm.user_id
      FROM club_members cm
      WHERE cm.club_id = NEW.club_id
      AND cm.status = 'active'
      AND cm.user_id != NEW.created_by -- Don't notify the author
    LOOP
      PERFORM create_challenge_notification(
        'club_announcement',
        member_record.user_id,
        '📢 Thông báo từ club',
        format('[%s] %s',
               club_info.club_name,
               LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END),
        NEW.club_id::TEXT,
        'megaphone',
        CASE NEW.priority
          WHEN 'urgent' THEN 'urgent'
          WHEN 'high' THEN 'high'
          ELSE 'medium'
        END,
        'Xem đầy đủ',
        '/clubs/' || NEW.club_id || '/announcements/' || NEW.id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. CLUB TOURNAMENT CREATION NOTIFICATIONS
-- ============================================================================

-- Function to notify about club tournaments
CREATE OR REPLACE FUNCTION notify_club_tournament_created()
RETURNS TRIGGER AS $$
DECLARE
  club_info RECORD;
  member_record RECORD;
  eligible_count INTEGER;
BEGIN
  -- Only proceed for new tournaments
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Get club details
  SELECT cp.club_name, cp.user_id as owner_id
  INTO club_info
  FROM club_profiles cp
  WHERE cp.id = NEW.club_id;
  
  -- Count eligible members (basic eligibility check)
  SELECT COUNT(*)
  INTO eligible_count
  FROM club_members cm
  JOIN profiles p ON cm.user_id = p.user_id
  WHERE cm.club_id = NEW.club_id
  AND cm.status = 'active';
  
  -- ========================================
  -- NOTIFY ELIGIBLE CLUB MEMBERS
  -- ========================================
  FOR member_record IN
    SELECT cm.user_id
    FROM club_members cm
    JOIN profiles p ON cm.user_id = p.user_id
    WHERE cm.club_id = NEW.club_id
    AND cm.status = 'active'
    AND cm.user_id != NEW.created_by -- Don't notify the organizer
  LOOP
    PERFORM create_challenge_notification(
      'club_tournament_created',
      member_record.user_id,
      '🏆 Giải đấu mới tại club',
      format('Club %s vừa tạo giải đấu "%s". Đăng ký mở: %s. Phí: %s VND',
             club_info.club_name,
             NEW.name,
             CASE 
               WHEN NEW.registration_start > NOW() THEN to_char(NEW.registration_start, 'DD/MM HH24:MI')
               ELSE 'Ngay bây giờ'
             END,
             COALESCE(NEW.entry_fee::TEXT, 'Miễn phí')),
      NEW.id::TEXT,
      'trophy',
      'high',
      'Đăng ký ngay',
      '/tournaments/' || NEW.id
    );
  END LOOP;
  
  -- ========================================
  -- NOTIFY ORGANIZER ABOUT MEMBER REACH
  -- ========================================
  PERFORM create_challenge_notification(
    'tournament_announced_to_members',
    NEW.created_by,
    '📣 Giải đấu đã được thông báo',
    format('Giải đấu "%s" đã được thông báo đến %s thành viên club.',
           NEW.name,
           eligible_count),
    NEW.id::TEXT,
    'users',
    'low',
    'Theo dõi đăng ký',
    '/tournaments/' || NEW.id || '/manage'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. CREATE TRIGGERS FOR CLUB MANAGEMENT SYSTEM
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS club_membership_notification_trigger ON club_membership_requests;
DROP TRIGGER IF EXISTS rank_verification_notification_trigger ON rank_verification_requests;
DROP TRIGGER IF EXISTS club_role_change_notification_trigger ON club_members;
DROP TRIGGER IF EXISTS club_announcement_notification_trigger ON club_announcements;
DROP TRIGGER IF EXISTS club_tournament_notification_trigger ON tournaments;

-- Create club membership trigger
CREATE TRIGGER club_membership_notification_trigger
    AFTER INSERT OR UPDATE ON club_membership_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_club_membership();

-- Create rank verification trigger
CREATE TRIGGER rank_verification_notification_trigger
    AFTER INSERT OR UPDATE ON rank_verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_rank_verification();

-- Create role change trigger
CREATE TRIGGER club_role_change_notification_trigger
    AFTER UPDATE ON club_members
    FOR EACH ROW
    EXECUTE FUNCTION notify_role_changes();

-- Create club announcement trigger
CREATE TRIGGER club_announcement_notification_trigger
    AFTER INSERT OR UPDATE ON club_announcements
    FOR EACH ROW
    EXECUTE FUNCTION notify_club_announcements();

-- Create club tournament trigger
CREATE TRIGGER club_tournament_notification_trigger
    AFTER INSERT ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION notify_club_tournament_created();

-- ============================================================================
-- 7. CREATE SUPPORTING TABLES (if they don't exist)
-- ============================================================================

-- Club membership requests table
CREATE TABLE IF NOT EXISTS club_membership_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES club_profiles(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

-- Rank verification requests table
CREATE TABLE IF NOT EXISTS rank_verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES club_profiles(id),
    player_id UUID NOT NULL REFERENCES auth.users(id),
    claimed_rank TEXT NOT NULL,
    evidence_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club announcements table
CREATE TABLE IF NOT EXISTS club_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES club_profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION notify_club_membership() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_rank_verification() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_role_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_club_announcements() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_club_tournament_created() TO authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE ON club_membership_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rank_verification_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON club_announcements TO authenticated;

-- ============================================================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION notify_club_membership() IS 'Handles all club membership workflow notifications';
COMMENT ON FUNCTION notify_rank_verification() IS 'Manages rank verification process notifications';
COMMENT ON FUNCTION notify_role_changes() IS 'Notifies about club role promotions and demotions';
COMMENT ON FUNCTION notify_club_announcements() IS 'Distributes club announcements to all members';
COMMENT ON FUNCTION notify_club_tournament_created() IS 'Notifies club members about new tournaments';

-- ============================================================================
-- 10. VERIFICATION QUERIES
-- ============================================================================

-- Check if all club triggers were created successfully
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    trigger_schema
FROM information_schema.triggers
WHERE trigger_name LIKE '%club%notification%'
   OR trigger_name LIKE '%rank%verification%'
   OR trigger_name LIKE '%role%change%'
ORDER BY trigger_name;

-- Check if club functions exist
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines
WHERE routine_name LIKE '%club%'
   OR routine_name LIKE '%rank%'
   OR routine_name LIKE '%role%'
ORDER BY routine_name;

-- ============================================================================
-- PHASE 2 CLUB MANAGEMENT NOTIFICATION SYSTEM IMPLEMENTATION COMPLETE!
-- 
-- What this provides:
-- ✅ Complete membership workflow automation
-- ✅ Rank verification process management
-- ✅ Role change notifications
-- ✅ Club announcement distribution
-- ✅ Tournament creation notifications
-- ✅ Multi-role permission handling
-- ✅ Transparent club operations
--
-- Next: Test the system and prepare for Phase 3 (SPA Ecosystem)
-- ============================================================================
