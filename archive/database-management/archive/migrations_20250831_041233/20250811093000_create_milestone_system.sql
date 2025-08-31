-- Milestone System Foundation (Phase 1)
-- Creates core milestone tables and seeds initial milestone definitions
-- Safe to run after 20250811090000_remove_milestones.sql cleanup

DO $$ BEGIN RAISE NOTICE 'Creating milestone system tables'; END $$;

-- Main milestones catalog
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('progress', 'achievement', 'social', 'repeatable')),
  milestone_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  spa_reward INTEGER NOT NULL DEFAULT 0,
  badge_name TEXT,
  badge_icon TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  is_repeatable BOOLEAN NOT NULL DEFAULT false,
  daily_limit INTEGER DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Player milestone progress tracking
CREATE TABLE IF NOT EXISTS public.player_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  last_progress_update TIMESTAMPTZ DEFAULT now(),
  times_completed INTEGER DEFAULT 0,
  last_daily_completion DATE DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, milestone_id)
);

-- Player daily aggregated counts (for daily & weekly style milestones)
CREATE TABLE IF NOT EXISTS public.player_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  daily_checkin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, date)
);

-- Login streaks
CREATE TABLE IF NOT EXISTS public.player_login_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_login_date DATE DEFAULT NULL,
  weekly_logins INTEGER DEFAULT 0,
  week_start_date DATE DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_player_milestones_player_id ON public.player_milestones(player_id);
CREATE INDEX IF NOT EXISTS idx_player_milestones_milestone_id ON public.player_milestones(milestone_id);
CREATE INDEX IF NOT EXISTS idx_player_daily_progress_player_date ON public.player_daily_progress(player_id, date);
CREATE INDEX IF NOT EXISTS idx_milestones_category ON public.milestones(category);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON public.milestones(milestone_type);

-- Seed initial milestone data (idempotent)
CREATE TEMP TABLE tmp_seed_milestones AS SELECT * FROM public.milestones WITH NO DATA;

INSERT INTO tmp_seed_milestones (name, description, category, milestone_type, requirement_value, spa_reward, badge_name, badge_icon, badge_color, is_repeatable, daily_limit, sort_order) VALUES
 ('Tạo tài khoản thành công','Chào mừng bạn đến với SABO Arena','progress','account_creation',1,100,'Chào mừng','👋','#10B981',false,null,1),
 ('Đăng ký hạng thành công','Xác định trình độ của bạn','progress','rank_registration',1,150,'Định vị','🎯','#3B82F6',false,null,2),
 ('Trận đấu đầu tiên','Bước chân vào sân đấu','progress','first_match',1,50,'Tân binh','🆕','#8B5CF6',false,null,3),
 ('5 trận đấu','Những bước đầu tiên','progress','match_count',5,100,'Bước đầu tiên','👶','#06B6D4',false,null,4),
 ('Đăng nhập 3 ngày liên tiếp','Thể hiện sự kiên trì','progress','login_streak',3,75,'Kiên trì','💪','#F59E0B',false,null,5),
 ('25 trận đấu','Trở thành người chơi thường xuyên','progress','match_count',25,200,'Người chơi thường xuyên','🏃','#EF4444',false,null,6),
 ('Đăng nhập hàng tuần trong 4 tuần','Người bạn thân thiết của SABO','progress','weekly_login',4,300,'Người bạn thân thiết','❤️','#EC4899',false,null,7),
 ('100 trận đấu','Cựu chiến binh của sân đấu','progress','match_count',100,500,'Cựu chiến binh','🎖️','#DC2626',false,null,8),
 ('Trận thắng hoàn hảo đầu tiên','Không mắc lỗi nào','achievement','perfect_match',1,150,'Hoàn hảo','💎','#7C3AED',false,null,9),
 ('Thắng liên tiếp 3 trận','Khởi đầu tốt','achievement','win_streak',3,100,'Khởi đầu nóng','🔥','#F97316',false,null,10),
 ('Thắng liên tiếp 7 trận','Chuỗi thắng ấn tượng','achievement','win_streak',7,250,'Chuỗi vàng','⭐','#EAB308',false,null,11),
 ('Tỷ lệ thắng 80%','Tỷ lệ thắng cao (tối thiểu 20 trận)','achievement','win_rate',80,400,'Xạ thủ','🎯','#059669',false,null,12),
 ('Tham gia Tournament đầu tiên','Dũng cảm bước vào đấu trường','achievement','tournament_join',1,100,'Dũng cảm','⚔️','#0EA5E9',false,null,13),
 ('Thắng Tournament đầu tiên','Vô địch đầu tiên','achievement','tournament_win',1,500,'Vô địch','👑','#FBBF24',false,null,14),
 ('Thắng 3 Tournament liên tiếp','Bá chủ đấu trường','achievement','tournament_streak',3,1000,'Bá chủ','🏆','#F59E0B',false,null,15),
 ('Tham gia Club đầu tiên','Tìm thấy đội nhóm','social','club_join',1,150,'Đồng đội','🤝','#10B981',false,null,16),
 ('Mời 3 bạn bè','Chia sẻ niềm vui','social','referral_count',3,300,'Người tuyển dụng','📢','#8B5CF6',false,null,17),
 ('Gửi thách đấu đầu tiên','Chủ động thách đấu','social','challenge_send',1,75,'Thách thức','⚡','#F97316',false,null,18),
 ('Thắng 10 thách đấu','Chiến thắng trong thách đấu','social','challenge_win',10,250,'Đấu sĩ','🥊','#DC2626',false,null,19),
 ('Giới thiệu bạn bằng mã ref','Bạn bè tạo tài khoản và đăng ký hạng','social','successful_referral',1,150,'Nhà tuyển dụng','🎪','#06B6D4',false,null,20),
 ('Giới thiệu CLB owner','Bạn bè tạo tài khoản và đăng ký CLB','social','club_owner_referral',1,500,'Nhà phát triển','🏗️','#059669',false,null,21),
 ('Tải ảnh đại diện','Cá nhân hóa hồ sơ','social','avatar_upload',1,50,'Danh tính','🖼️','#3B82F6',false,null,22),
 ('Hoàn thành hồ sơ 100%','Điền đầy đủ thông tin','social','profile_complete',1,100,'Hoàn chỉnh','✅','#10B981',false,null,23),
 ('Điểm danh hàng ngày','Điểm danh mỗi ngày','repeatable','daily_checkin',1,20,null,'📅','#6B7280',true,1,24),
 ('Chơi 3 trận mỗi ngày','Duy trì hoạt động hàng ngày','repeatable','daily_matches',3,30,null,'🎮','#8B5CF6',true,1,25),
 ('Thắng 2 trận mỗi ngày','Chiến thắng hàng ngày','repeatable','daily_wins',2,50,null,'🏅','#F59E0B',true,1,26),
 ('Thắng 10 trận trong tuần','Chiến thắng hàng tuần','repeatable','weekly_wins',10,200,null,'📊','#EF4444',true,null,27),
 ('Hoàn thành 5 thách đấu trong tuần','Thách đấu hàng tuần','repeatable','weekly_challenges',5,150,null,'⚔️','#0EA5E9',true,null,28),
 ('Điểm danh đủ 7 ngày trong tuần','Tuần hoàn hảo','repeatable','weekly_checkin',7,100,'Tuần hoàn hảo','🌟','#7C3AED',true,null,29),
 ('Điểm danh liên tiếp 7 ngày','Bonus chuỗi điểm danh','repeatable','checkin_streak_7',7,50,null,'🔥','#F97316',true,null,30),
 ('Điểm danh liên tiếp 30 ngày','Tháng vàng','repeatable','checkin_streak_30',30,200,'Tháng vàng','👑','#FBBF24',true,null,31);

INSERT INTO public.milestones (name, description, category, milestone_type, requirement_value, spa_reward, badge_name, badge_icon, badge_color, is_repeatable, daily_limit, sort_order)
SELECT t.name, t.description, t.category, t.milestone_type, t.requirement_value, t.spa_reward, t.badge_name, t.badge_icon, t.badge_color, t.is_repeatable, t.daily_limit, t.sort_order
FROM tmp_seed_milestones t
LEFT JOIN public.milestones m
  ON m.milestone_type = t.milestone_type AND m.requirement_value = t.requirement_value
WHERE m.id IS NULL;

DROP TABLE IF EXISTS tmp_seed_milestones;

DO $$ BEGIN RAISE NOTICE 'Milestone system tables & seed complete'; END $$;
