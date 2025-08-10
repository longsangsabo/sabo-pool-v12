-- =============================================
-- SABO POOL ARENA - SPA SYSTEM RESET & MILESTONES
-- Reset tất cả điểm SPA về 0 và tạo hệ thống milestone mới
-- =============================================

-- BƯỚC 1: Reset tất cả điểm SPA về 0
UPDATE public.player_rankings 
SET spa_points = 0, 
    updated_at = NOW()
WHERE spa_points > 0;

-- Reset wallet points_balance về 0
UPDATE public.wallets 
SET points_balance = 0, 
    updated_at = NOW()
WHERE points_balance > 0;

-- Tạo log để ghi nhận việc reset
INSERT INTO public.spa_points_log (user_id, points, category, description, created_at)
SELECT 
  user_id, 
  -spa_points, 
  'system_reset', 
  'Reset hệ thống SPA - Khởi tạo lại từ 0 điểm', 
  NOW()
FROM public.player_rankings 
WHERE spa_points > 0;

-- BƯỚC 2: Tạo bảng SPA Milestones
CREATE TABLE IF NOT EXISTS public.spa_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_name TEXT NOT NULL,
  milestone_type TEXT NOT NULL, -- 'registration', 'rank_verification', 'referral', 'tournament', 'challenge', 'login_streak', 'achievement'
  requirement_value INTEGER NOT NULL DEFAULT 1,
  spa_reward INTEGER NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  is_active BOOLEAN DEFAULT TRUE,
  is_repeatable BOOLEAN DEFAULT FALSE,
  max_per_day INTEGER DEFAULT NULL, -- Giới hạn số lần nhận mỗi ngày
  requirement_conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BƯỚC 3: Tạo bảng theo dõi milestone của user
CREATE TABLE IF NOT EXISTS public.user_milestone_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.spa_milestones(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  spa_earned INTEGER DEFAULT 0,
  last_progress_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- BƯỚC 4: Tạo bảng SPA reward history
CREATE TABLE IF NOT EXISTS public.spa_reward_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.spa_milestones(id),
  spa_amount INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'milestone', 'bonus', 'penalty', 'manual'
  source_description TEXT,
  reference_id UUID, -- ID của tournament, challenge, etc.
  reference_type TEXT, -- 'tournament', 'challenge', 'referral', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BƯỚC 5: Thêm dữ liệu milestone ban đầu
INSERT INTO public.spa_milestones (milestone_name, milestone_type, requirement_value, spa_reward, description, icon, is_repeatable, max_per_day) VALUES
-- Milestone đăng ký và onboarding
('Chào mừng thành viên mới', 'registration', 1, 100, 'Tặng ngay 100 SPA khi đăng ký tài khoản thành công', '🎉', false, null),
('Xác thực hạng thành công', 'rank_verification', 1, 200, 'Nhận 200 SPA khi xác thực hạng thành công', '🏅', false, null),
('Hoàn thành profile', 'profile_completion', 1, 50, 'Nhận 50 SPA khi hoàn thành đầy đủ thông tin profile', '✨', false, null),

-- Milestone giới thiệu bạn bè
('Giới thiệu bạn bè thành công', 'referral_success', 1, 150, 'Nhận 150 SPA khi bạn bè đăng ký qua link giới thiệu và xác thực hạng', '👥', true, null),
('Người được giới thiệu', 'referred_user', 1, 100, 'Nhận 100 SPA khi đăng ký qua link giới thiệu của bạn bè', '🤝', false, null),

-- Milestone hoạt động hàng ngày
('Đăng nhập hàng ngày', 'daily_login', 1, 10, 'Nhận 10 SPA cho mỗi ngày đăng nhập', '📅', true, 1),
('Chuỗi đăng nhập 7 ngày', 'login_streak_7', 7, 100, 'Nhận 100 SPA khi đăng nhập liên tục 7 ngày', '🔥', true, null),
('Chuỗi đăng nhập 30 ngày', 'login_streak_30', 30, 500, 'Nhận 500 SPA khi đăng nhập liên tục 30 ngày', '🌟', true, null),

-- Milestone tournament
('Tham gia tournament đầu tiên', 'first_tournament', 1, 100, 'Nhận 100 SPA khi tham gia tournament đầu tiên', '🏆', false, null),
('Thắng tournament', 'tournament_champion', 1, 300, 'Nhận 300 SPA khi vô địch tournament', '👑', true, null),
('Top 3 tournament', 'tournament_top3', 1, 150, 'Nhận 150 SPA khi đạt top 3 trong tournament', '🥉', true, null),

-- Milestone challenges
('Thách đấu đầu tiên', 'first_challenge', 1, 50, 'Nhận 50 SPA khi hoàn thành thách đấu đầu tiên', '⚔️', false, null),
('Thắng 10 thách đấu', 'challenge_wins_10', 10, 200, 'Nhận 200 SPA khi thắng 10 thách đấu', '💪', false, null),
('Thắng 50 thách đấu', 'challenge_wins_50', 50, 500, 'Nhận 500 SPA khi thắng 50 thách đấu', '🏋️', false, null),
('Thắng 100 thách đấu', 'challenge_wins_100', 100, 1000, 'Nhận 1000 SPA khi thắng 100 thách đấu', '🚀', false, null),

-- Milestone thành tích đặc biệt
('Chuỗi thắng 5 trận', 'win_streak_5', 5, 100, 'Nhận 100 SPA khi thắng liên tiếp 5 trận', '🔥', true, null),
('Chuỗi thắng 10 trận', 'win_streak_10', 10, 300, 'Nhận 300 SPA khi thắng liên tiếp 10 trận', '⚡', true, null),
('Thăng hạng', 'rank_promotion', 1, 250, 'Nhận 250 SPA khi thăng hạng thành công', '📈', true, null),

-- Milestone cộng đồng
('Tham gia CLB', 'join_club', 1, 75, 'Nhận 75 SPA khi tham gia CLB đầu tiên', '🏛️', false, null),
('Tạo CLB', 'create_club', 1, 200, 'Nhận 200 SPA khi tạo CLB thành công', '🏗️', false, null),

-- Milestone hoạt động đặc biệt
('Chia sẻ thành tích', 'share_achievement', 1, 25, 'Nhận 25 SPA khi chia sẻ thành tích lần đầu', '📢', false, null),
('Đánh giá ứng dụng', 'app_review', 1, 100, 'Nhận 100 SPA khi đánh giá ứng dụng', '⭐', false, null);

-- BƯỚC 6: Tạo function để award SPA milestone
CREATE OR REPLACE FUNCTION public.award_spa_milestone(
  p_user_id UUID,
  p_milestone_type TEXT,
  p_progress_increment INTEGER DEFAULT 1,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_milestone RECORD;
  v_progress RECORD;
  v_current_spa INTEGER;
  v_new_spa INTEGER;
  v_daily_count INTEGER;
  v_result JSONB;
  v_milestones_completed INTEGER := 0;
BEGIN
  -- Lấy thông tin milestone
  SELECT * INTO v_milestone
  FROM spa_milestones
  WHERE milestone_type = p_milestone_type
    AND is_active = true
  ORDER BY requirement_value ASC
  LIMIT 1;

  IF v_milestone.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Milestone not found: ' || p_milestone_type
    );
  END IF;

  -- Kiểm tra giới hạn hàng ngày nếu có
  IF v_milestone.max_per_day IS NOT NULL THEN
    SELECT COUNT(*) INTO v_daily_count
    FROM spa_reward_history
    WHERE user_id = p_user_id
      AND milestone_id = v_milestone.id
      AND created_at >= CURRENT_DATE
      AND created_at < (CURRENT_DATE + INTERVAL '1 day');

    IF v_daily_count >= v_milestone.max_per_day THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Daily limit reached for milestone: ' || v_milestone.milestone_name
      );
    END IF;
  END IF;

  -- Lấy hoặc tạo progress record
  INSERT INTO user_milestone_progress (user_id, milestone_id, current_progress)
  VALUES (p_user_id, v_milestone.id, 0)
  ON CONFLICT (user_id, milestone_id) 
  DO NOTHING;

  SELECT * INTO v_progress
  FROM user_milestone_progress
  WHERE user_id = p_user_id AND milestone_id = v_milestone.id;

  -- Nếu đã hoàn thành và không repeatable thì skip
  IF v_progress.is_completed AND NOT v_milestone.is_repeatable THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Milestone already completed: ' || v_milestone.milestone_name
    );
  END IF;

  -- Cập nhật progress
  UPDATE user_milestone_progress
  SET current_progress = current_progress + p_progress_increment,
      last_progress_update = NOW()
  WHERE user_id = p_user_id AND milestone_id = v_milestone.id;

  -- Lấy progress mới
  SELECT * INTO v_progress
  FROM user_milestone_progress
  WHERE user_id = p_user_id AND milestone_id = v_milestone.id;

  -- Kiểm tra nếu đã đạt requirement
  IF v_progress.current_progress >= v_milestone.requirement_value THEN
    -- Đánh dấu hoàn thành
    UPDATE user_milestone_progress
    SET is_completed = true,
        completed_at = NOW(),
        spa_earned = spa_earned + v_milestone.spa_reward
    WHERE user_id = p_user_id AND milestone_id = v_milestone.id;

    -- Cập nhật SPA points
    SELECT COALESCE(spa_points, 0) INTO v_current_spa
    FROM player_rankings
    WHERE user_id = p_user_id;

    IF v_current_spa IS NULL THEN
      INSERT INTO player_rankings (user_id, spa_points)
      VALUES (p_user_id, v_milestone.spa_reward);
      v_new_spa := v_milestone.spa_reward;
    ELSE
      v_new_spa := v_current_spa + v_milestone.spa_reward;
      UPDATE player_rankings
      SET spa_points = v_new_spa,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;

    -- Sync với wallet
    UPDATE wallets
    SET points_balance = v_new_spa,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Tạo SPA log
    INSERT INTO spa_points_log (user_id, points, category, description, reference_id, reference_type)
    VALUES (p_user_id, v_milestone.spa_reward, 'milestone', v_milestone.milestone_name, p_reference_id, p_reference_type);

    -- Tạo reward history
    INSERT INTO spa_reward_history (user_id, milestone_id, spa_amount, reward_type, source_description, reference_id, reference_type, metadata)
    VALUES (p_user_id, v_milestone.id, v_milestone.spa_reward, 'milestone', v_milestone.milestone_name, p_reference_id, p_reference_type, p_metadata);

    -- Tạo notification
    INSERT INTO notifications (user_id, type, title, message, priority, metadata)
    VALUES (
      p_user_id,
      'milestone_completed',
      '🎉 Milestone hoàn thành!',
      format('Bạn đã hoàn thành "%s" và nhận được %s SPA!', v_milestone.milestone_name, v_milestone.spa_reward),
      'medium',
      jsonb_build_object(
        'milestone_id', v_milestone.id,
        'spa_reward', v_milestone.spa_reward,
        'milestone_name', v_milestone.milestone_name
      )
    );

    v_milestones_completed := 1;

    -- Reset progress cho repeatable milestones
    IF v_milestone.is_repeatable THEN
      UPDATE user_milestone_progress
      SET current_progress = 0,
          is_completed = false
      WHERE user_id = p_user_id AND milestone_id = v_milestone.id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'milestone_name', v_milestone.milestone_name,
    'current_progress', v_progress.current_progress,
    'requirement_value', v_milestone.requirement_value,
    'milestones_completed', v_milestones_completed,
    'spa_earned', CASE WHEN v_milestones_completed > 0 THEN v_milestone.spa_reward ELSE 0 END,
    'new_total_spa', COALESCE(v_new_spa, v_current_spa)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- BƯỚC 7: Tạo function để tặng SPA bonus đặc biệt
CREATE OR REPLACE FUNCTION public.award_spa_bonus(
  p_user_id UUID,
  p_amount INTEGER,
  p_bonus_type TEXT,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_spa INTEGER;
  v_new_spa INTEGER;
BEGIN
  -- Lấy SPA hiện tại
  SELECT COALESCE(spa_points, 0) INTO v_current_spa
  FROM player_rankings
  WHERE user_id = p_user_id;

  IF v_current_spa IS NULL THEN
    INSERT INTO player_rankings (user_id, spa_points)
    VALUES (p_user_id, p_amount);
    v_new_spa := p_amount;
  ELSE
    v_new_spa := v_current_spa + p_amount;
    UPDATE player_rankings
    SET spa_points = v_new_spa,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Sync với wallet
  UPDATE wallets
  SET points_balance = v_new_spa,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Tạo log
  INSERT INTO spa_points_log (user_id, points, category, description, reference_id, reference_type)
  VALUES (p_user_id, p_amount, p_bonus_type, p_description, p_reference_id, p_reference_type);

  -- Tạo reward history
  INSERT INTO spa_reward_history (user_id, spa_amount, reward_type, source_description, reference_id, reference_type)
  VALUES (p_user_id, p_amount, 'bonus', p_description, p_reference_id, p_reference_type);

  -- Tạo notification nếu là bonus lớn
  IF p_amount >= 50 THEN
    INSERT INTO notifications (user_id, type, title, message, priority)
    VALUES (
      p_user_id,
      'spa_bonus',
      '💰 Nhận thưởng SPA!',
      format('Bạn nhận được %s SPA từ %s', p_amount, p_description),
      'medium'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'spa_awarded', p_amount,
    'previous_spa', v_current_spa,
    'new_total_spa', v_new_spa,
    'bonus_type', p_bonus_type,
    'description', p_description
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- BƯỚC 8: Cập nhật trigger để auto-award milestone khi user đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user_spa_milestones()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate referral code nếu chưa có
  IF NEW.my_referral_code IS NULL THEN
    NEW.my_referral_code := public.generate_referral_code(NEW.user_id);
  END IF;

  -- Award milestone đăng ký (thay thế cho old signup bonus)
  PERFORM public.award_spa_milestone(
    NEW.user_id,
    'registration',
    1,
    NEW.user_id,
    'user_registration'
  );

  -- Nếu được giới thiệu, award milestone referred_user
  IF NEW.referred_by_code IS NOT NULL THEN
    PERFORM public.award_spa_milestone(
      NEW.user_id,
      'referred_user',
      1,
      NEW.user_id,
      'referral'
    );

    -- Tạo referral record
    INSERT INTO public.referrals (
      referrer_id,
      referred_id,
      referral_code
    )
    SELECT 
      p.user_id,
      NEW.user_id,
      NEW.referred_by_code
    FROM public.profiles p
    WHERE p.my_referral_code = NEW.referred_by_code;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Cập nhật trigger
DROP TRIGGER IF EXISTS on_user_signup_spa_milestones ON public.profiles;
CREATE TRIGGER on_user_signup_spa_milestones
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_spa_milestones();

-- BƯỚC 9: Cập nhật trigger referral completion
CREATE OR REPLACE FUNCTION public.complete_referral_spa_milestone()
RETURNS TRIGGER AS $$
DECLARE
  v_referral RECORD;
BEGIN
  -- Kiểm tra nếu rank vừa được verify
  IF NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
    
    -- Award milestone rank verification
    PERFORM public.award_spa_milestone(
      NEW.user_id,
      'rank_verification',
      1,
      NEW.id,
      'rank_verification'
    );

    -- Tìm người giới thiệu và award milestone
    SELECT * INTO v_referral
    FROM public.referrals
    WHERE referred_id = NEW.user_id
      AND status = 'pending';

    IF v_referral.id IS NOT NULL THEN
      -- Cập nhật status referral
      UPDATE public.referrals
      SET status = 'completed',
          completed_at = NOW()
      WHERE id = v_referral.id;

      -- Award milestone cho người giới thiệu
      PERFORM public.award_spa_milestone(
        v_referral.referrer_id,
        'referral_success',
        1,
        v_referral.id,
        'referral'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Cập nhật trigger cho rank verification
DROP TRIGGER IF EXISTS on_rank_verification_spa_milestone ON public.rank_verifications;
CREATE TRIGGER on_rank_verification_spa_milestone
  AFTER UPDATE ON public.rank_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.complete_referral_spa_milestone();

-- BƯỚC 10: Tạo RLS policies
ALTER TABLE public.spa_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view milestones" ON public.spa_milestones FOR SELECT USING (true);
CREATE POLICY "Only admins can manage milestones" ON public.spa_milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

ALTER TABLE public.user_milestone_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own milestone progress" ON public.user_milestone_progress
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage milestone progress" ON public.user_milestone_progress
FOR ALL USING (true);

ALTER TABLE public.spa_reward_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reward history" ON public.spa_reward_history
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert reward history" ON public.spa_reward_history
FOR INSERT WITH CHECK (true);

-- BƯỚC 11: Tạo function để get milestone progress của user
CREATE OR REPLACE FUNCTION public.get_user_milestone_progress(p_user_id UUID)
RETURNS TABLE (
  milestone_id UUID,
  milestone_name TEXT,
  milestone_type TEXT,
  description TEXT,
  icon TEXT,
  requirement_value INTEGER,
  current_progress INTEGER,
  spa_reward INTEGER,
  is_completed BOOLEAN,
  is_repeatable BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.milestone_name,
    m.milestone_type,
    m.description,
    m.icon,
    m.requirement_value,
    COALESCE(p.current_progress, 0),
    m.spa_reward,
    COALESCE(p.is_completed, false),
    m.is_repeatable,
    p.completed_at
  FROM spa_milestones m
  LEFT JOIN user_milestone_progress p ON m.id = p.milestone_id AND p.user_id = p_user_id
  WHERE m.is_active = true
  ORDER BY m.milestone_type, m.requirement_value;
END;
$$;

-- BƯỚC 12: Tạo function để award daily login
CREATE OR REPLACE FUNCTION public.award_daily_login_milestone(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today_login BOOLEAN;
  v_result JSONB;
BEGIN
  -- Kiểm tra đã đăng nhập hôm nay chưa
  SELECT EXISTS(
    SELECT 1 FROM spa_reward_history 
    WHERE user_id = p_user_id 
      AND reward_type = 'milestone'
      AND source_description = 'Đăng nhập hàng ngày'
      AND created_at >= CURRENT_DATE
      AND created_at < (CURRENT_DATE + INTERVAL '1 day')
  ) INTO v_today_login;

  IF NOT v_today_login THEN
    -- Award daily login milestone
    SELECT public.award_spa_milestone(
      p_user_id,
      'daily_login',
      1,
      NULL,
      'daily_login'
    ) INTO v_result;
    
    RETURN v_result;
  END IF;

  RETURN jsonb_build_object(
    'success', false,
    'error', 'Already logged in today'
  );
END;
$$;

-- BƯỚC 13: Insert dữ liệu cho existing users để tránh miss milestone
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Award registration milestone cho tất cả user hiện tại
  FOR user_record IN 
    SELECT user_id FROM public.profiles
  LOOP
    PERFORM public.award_spa_milestone(
      user_record.user_id,
      'registration',
      1,
      user_record.user_id,
      'retroactive_registration'
    );
  END LOOP;
  
  RAISE NOTICE 'Completed retroactive milestone awards for existing users';
END;
$$;

-- BƯỚC 14: Tạo index để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_user_milestone_progress_user_id ON user_milestone_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestone_progress_milestone_id ON user_milestone_progress(milestone_id);
CREATE INDEX IF NOT EXISTS idx_spa_reward_history_user_id ON spa_reward_history(user_id);
CREATE INDEX IF NOT EXISTS idx_spa_reward_history_created_at ON spa_reward_history(created_at);
CREATE INDEX IF NOT EXISTS idx_spa_milestones_type ON spa_milestones(milestone_type);

-- HOÀN THÀNH MIGRATION
-- Log hoàn thành
INSERT INTO public.spa_points_log (user_id, points, category, description, created_at)
SELECT 
  '00000000-0000-0000-0000-000000000000'::UUID,
  0, 
  'system_migration', 
  'Hoàn thành migration: Reset SPA system và tạo milestone system mới', 
  NOW();

-- Comment summary
COMMENT ON TABLE public.spa_milestones IS 'Bảng định nghĩa các milestone SPA có thể đạt được';
COMMENT ON TABLE public.user_milestone_progress IS 'Bảng theo dõi tiến độ milestone của từng user';
COMMENT ON TABLE public.spa_reward_history IS 'Bảng lịch sử nhận thưởng SPA từ milestones và bonuses';
COMMENT ON FUNCTION public.award_spa_milestone IS 'Function tự động tặng SPA khi user đạt milestone';
COMMENT ON FUNCTION public.award_spa_bonus IS 'Function tặng SPA bonus đặc biệt';
