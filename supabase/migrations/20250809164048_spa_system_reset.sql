-- Reset all user SPA points to 0
UPDATE player_rankings SET spa_points = 0;

-- Create SPA milestones table
CREATE TABLE IF NOT EXISTS spa_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL,
    reward_points INTEGER NOT NULL,
    milestone_type VARCHAR(50) NOT NULL, -- 'games_played', 'wins', 'spa_earned', 'tournaments_joined', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user milestone progress tracking
CREATE TABLE IF NOT EXISTS user_milestone_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES spa_milestones(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, milestone_id)
);

-- Create SPA bonus activities table
CREATE TABLE IF NOT EXISTS spa_bonus_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_type VARCHAR(100) NOT NULL, -- 'new_user', 'rank_registration', 'referral_success', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    bonus_points INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_claims_per_user INTEGER DEFAULT 1, -- How many times a user can claim this bonus
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user bonus claims tracking
CREATE TABLE IF NOT EXISTS user_bonus_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES spa_bonus_activities(id) ON DELETE CASCADE,
    points_awarded INTEGER NOT NULL,
    reference_data JSONB, -- Store additional data like referral_user_id, etc.
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, activity_id) -- Prevent duplicate claims for single-claim activities
);

-- Create SPA transaction log for tracking all point changes
CREATE TABLE IF NOT EXISTS spa_transaction_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'milestone_reward', 'bonus_activity', 'admin_adjustment', etc.
    points_change INTEGER NOT NULL, -- Positive for earning, negative for deduction
    previous_balance INTEGER NOT NULL,
    new_balance INTEGER NOT NULL,
    description TEXT,
    reference_id UUID, -- Reference to milestone_id, activity_id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial SPA milestones
INSERT INTO spa_milestones (title, description, target_value, reward_points, milestone_type) VALUES
('Người chơi mới', 'Chơi trận đầu tiên', 1, 50, 'games_played'),
('Kinh nghiệm', 'Chơi 10 trận', 10, 100, 'games_played'),
('Dày dặn', 'Chơi 50 trận', 50, 250, 'games_played'),
('Cao thủ', 'Chơi 100 trận', 100, 500, 'games_played'),
('Chuyên gia', 'Chơi 500 trận', 500, 1000, 'games_played'),

('Thắng lợi đầu tiên', 'Thắng trận đầu tiên', 1, 75, 'wins'),
('Chiến thắng liên tiếp', 'Thắng 5 trận', 5, 150, 'wins'),
('Bất bại', 'Thắng 25 trận', 25, 400, 'wins'),
('Vô địch', 'Thắng 100 trận', 100, 800, 'wins'),

('Giàu có', 'Tích lũy 1000 SPA', 1000, 200, 'spa_earned'),
('Đại gia', 'Tích lũy 5000 SPA', 5000, 500, 'spa_earned'),
('Tỷ phú', 'Tích lũy 10000 SPA', 10000, 1000, 'spa_earned'),

('Tham gia giải đấu', 'Tham gia giải đấu đầu tiên', 1, 100, 'tournaments_joined'),
('Fan giải đấu', 'Tham gia 5 giải đấu', 5, 300, 'tournaments_joined'),
('Chuyên gia giải đấu', 'Tham gia 20 giải đấu', 20, 750, 'tournaments_joined');

-- Insert bonus activities
INSERT INTO spa_bonus_activities (activity_type, title, description, bonus_points, max_claims_per_user) VALUES
('new_user', 'Chào mừng thành viên mới', 'Tặng điểm SPA cho tài khoản mới', 100, 1),
('rank_registration', 'Đăng ký hạng thành công', 'Tặng điểm SPA khi đăng ký hạng thành công', 200, 1),
('referral_success', 'Giới thiệu bạn bè', 'Tặng điểm SPA khi giới thiệu thành công một người bạn', 150, 100),
('first_tournament_win', 'Thắng giải đấu đầu tiên', 'Tặng điểm SPA khi thắng giải đấu đầu tiên', 300, 1),
('monthly_login', 'Đăng nhập hàng ngày', 'Tặng điểm SPA cho việc đăng nhập 30 ngày liên tiếp', 250, 12),
('profile_complete', 'Hoàn thiện profile', 'Tặng điểm SPA khi hoàn thiện đầy đủ thông tin profile', 75, 1),
('first_deposit', 'Nạp tiền lần đầu', 'Tặng điểm SPA cho lần nạp tiền đầu tiên', 500, 1),
('social_share', 'Chia sẻ lên mạng xã hội', 'Tặng điểm SPA khi chia sẻ thành tích lên mạng xã hội', 25, 10);

-- Create indexes for better performance
CREATE INDEX idx_user_milestone_progress_user_id ON user_milestone_progress(user_id);
CREATE INDEX idx_user_milestone_progress_milestone_id ON user_milestone_progress(milestone_id);
CREATE INDEX idx_user_bonus_claims_user_id ON user_bonus_claims(user_id);
CREATE INDEX idx_spa_transaction_log_user_id ON spa_transaction_log(user_id);
CREATE INDEX idx_spa_transaction_log_created_at ON spa_transaction_log(created_at);

-- Create function to update SPA points safely
CREATE OR REPLACE FUNCTION update_spa_points(
    p_user_id UUID,
    p_points_change INTEGER,
    p_transaction_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    current_points INTEGER;
    new_points INTEGER;
BEGIN
    -- Get current SPA points
    SELECT COALESCE(spa_points, 0) INTO current_points
    FROM player_rankings 
    WHERE user_id = p_user_id;
    
    -- If user doesn't exist in player_rankings, create record
    IF current_points IS NULL THEN
        INSERT INTO player_rankings (user_id, spa_points, total_games, wins, losses)
        VALUES (p_user_id, 0, 0, 0, 0);
        current_points := 0;
    END IF;
    
    -- Calculate new points (ensure it doesn't go below 0)
    new_points := GREATEST(current_points + p_points_change, 0);
    
    -- Update player_rankings
    UPDATE player_rankings 
    SET spa_points = new_points,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log the transaction
    INSERT INTO spa_transaction_log (
        user_id, transaction_type, points_change, 
        previous_balance, new_balance, description, reference_id
    ) VALUES (
        p_user_id, p_transaction_type, p_points_change,
        current_points, new_points, p_description, p_reference_id
    );
    
    RETURN new_points;
END;
$$ LANGUAGE plpgsql;

-- Create function to check and award milestone rewards
CREATE OR REPLACE FUNCTION check_milestone_progress(
    p_user_id UUID,
    p_milestone_type VARCHAR(50),
    p_current_value INTEGER
) RETURNS VOID AS $$
DECLARE
    milestone_record RECORD;
    progress_record RECORD;
BEGIN
    -- Loop through all active milestones of the given type
    FOR milestone_record IN 
        SELECT * FROM spa_milestones 
        WHERE milestone_type = p_milestone_type 
        AND is_active = true 
        AND target_value <= p_current_value
    LOOP
        -- Check if user has progress record for this milestone
        SELECT * INTO progress_record
        FROM user_milestone_progress
        WHERE user_id = p_user_id AND milestone_id = milestone_record.id;
        
        -- If no progress record exists, create one
        IF progress_record IS NULL THEN
            INSERT INTO user_milestone_progress (
                user_id, milestone_id, current_progress, 
                is_completed, completed_at, reward_claimed
            ) VALUES (
                p_user_id, milestone_record.id, p_current_value,
                true, NOW(), true
            );
            
            -- Award the points
            PERFORM update_spa_points(
                p_user_id, 
                milestone_record.reward_points,
                'milestone_reward',
                'Hoàn thành milestone: ' || milestone_record.title,
                milestone_record.id
            );
            
        -- If progress exists but not completed, check if should be completed
        ELSIF NOT progress_record.is_completed AND p_current_value >= milestone_record.target_value THEN
            UPDATE user_milestone_progress
            SET current_progress = p_current_value,
                is_completed = true,
                completed_at = NOW(),
                reward_claimed = true,
                updated_at = NOW()
            WHERE id = progress_record.id;
            
            -- Award the points
            PERFORM update_spa_points(
                p_user_id, 
                milestone_record.reward_points,
                'milestone_reward',
                'Hoàn thành milestone: ' || milestone_record.title,
                milestone_record.id
            );
            
        -- Just update progress if not completed yet
        ELSIF NOT progress_record.is_completed THEN
            UPDATE user_milestone_progress
            SET current_progress = p_current_value,
                updated_at = NOW()
            WHERE id = progress_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to award bonus activities
CREATE OR REPLACE FUNCTION award_bonus_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(100),
    p_reference_data JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    activity_record RECORD;
    claim_count INTEGER;
BEGIN
    -- Get the bonus activity
    SELECT * INTO activity_record
    FROM spa_bonus_activities
    WHERE activity_type = p_activity_type AND is_active = true;
    
    -- If activity doesn't exist, return false
    IF activity_record IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check how many times user has claimed this bonus
    SELECT COUNT(*) INTO claim_count
    FROM user_bonus_claims
    WHERE user_id = p_user_id AND activity_id = activity_record.id;
    
    -- Check if user can still claim this bonus
    IF claim_count >= activity_record.max_claims_per_user THEN
        RETURN false;
    END IF;
    
    -- Award the bonus
    INSERT INTO user_bonus_claims (
        user_id, activity_id, points_awarded, reference_data
    ) VALUES (
        p_user_id, activity_record.id, activity_record.bonus_points, p_reference_data
    );
    
    -- Update SPA points
    PERFORM update_spa_points(
        p_user_id,
        activity_record.bonus_points,
        'bonus_activity',
        'Bonus: ' || activity_record.title,
        activity_record.id
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE spa_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestone_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE spa_bonus_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bonus_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE spa_transaction_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view active milestones" ON spa_milestones
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own milestone progress" ON user_milestone_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view active bonus activities" ON spa_bonus_activities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own bonus claims" ON user_bonus_claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transaction log" ON spa_transaction_log
    FOR SELECT USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON spa_milestones TO anon, authenticated;
GRANT SELECT ON user_milestone_progress TO authenticated;
GRANT SELECT ON spa_bonus_activities TO anon, authenticated;
GRANT SELECT ON user_bonus_claims TO authenticated;
GRANT SELECT ON spa_transaction_log TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION update_spa_points(UUID, INTEGER, VARCHAR(50), TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_milestone_progress(UUID, VARCHAR(50), INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION award_bonus_activity(UUID, VARCHAR(100), JSONB) TO authenticated;
