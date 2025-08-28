-- CREATE SAMPLE MILESTONES FOR TESTING
-- Date: 2025-08-11

-- Insert sample milestones if they don't exist
INSERT INTO public.milestones (
    name, 
    description, 
    category, 
    milestone_type, 
    requirement_value, 
    spa_reward, 
    badge_color, 
    is_repeatable, 
    is_active, 
    sort_order
) 
SELECT * FROM (VALUES 
    ('Đăng ký hạng thành công', 'Hoàn thành việc đăng ký hạng thi đấu', 'progress', 'rank_registration', 1, 150, '#8B5CF6', false, true, 1),
    ('5 trận đầu', 'Hoàn thành 5 trận đấu đầu tiên', 'progress', 'match_count', 5, 100, '#3B82F6', false, true, 2),
    ('25 trận đấu', 'Hoàn thành 25 trận đấu', 'progress', 'match_count', 25, 250, '#3B82F6', false, true, 3),
    ('100 trận đấu', 'Hoàn thành 100 trận đấu', 'achievement', 'match_count', 100, 500, '#3B82F6', false, true, 4),
    ('Thắng 10 thách đấu', 'Giành chiến thắng trong 10 thách đấu', 'achievement', 'challenge_win', 10, 200, '#F59E0B', false, true, 5),
    ('Thắng 50 thách đấu', 'Giành chiến thắng trong 50 thách đấu', 'achievement', 'challenge_win', 50, 750, '#F59E0B', false, true, 6),
    ('Check-in 7 ngày', 'Check-in hàng ngày trong 7 ngày', 'social', 'daily_checkin', 7, 150, '#10B981', true, true, 7),
    ('Chuỗi đăng nhập 10 ngày', 'Đăng nhập liên tiếp trong 10 ngày', 'social', 'login_streak', 10, 300, '#06B6D4', false, true, 8)
) AS v(name, description, category, milestone_type, requirement_value, spa_reward, badge_color, is_repeatable, is_active, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.milestones m 
    WHERE m.name = v.name AND m.milestone_type = v.milestone_type
);

-- Check inserted milestones
SELECT 
    name,
    description,
    milestone_type,
    requirement_value,
    spa_reward,
    category
FROM public.milestones 
WHERE is_active = true
ORDER BY sort_order;
