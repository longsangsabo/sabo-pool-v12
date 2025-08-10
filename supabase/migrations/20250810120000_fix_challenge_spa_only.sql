-- Fix Challenge System: Remove ELO logic, use SPA points only
-- ELO points should only be awarded through tournaments, not challenges
-- Challenges use SPA points for betting (100-600 points)

-- 1. Update challenge_results table to remove ELO fields and add SPA fields
ALTER TABLE challenge_results 
DROP COLUMN IF EXISTS elo_points_exchanged,
DROP COLUMN IF EXISTS winner_elo_change, 
DROP COLUMN IF EXISTS loser_elo_change;

-- Add SPA-related fields to challenge_results
ALTER TABLE challenge_results 
ADD COLUMN IF NOT EXISTS spa_points_exchanged INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS winner_spa_change INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS loser_spa_change INTEGER NOT NULL DEFAULT 0;

-- 2. Update challenges table - bet_points should refer to SPA points, not ELO
ALTER TABLE challenges 
DROP CONSTRAINT IF EXISTS challenges_bet_points_check,
ADD CONSTRAINT challenges_bet_points_check CHECK (bet_points IN (100, 200, 300, 400, 500, 600));

COMMENT ON COLUMN challenges.bet_points IS 'SPA points used for betting in challenges (100, 200, 300, 400, 500, 600)';

-- 3. Create new function to calculate SPA points for challenges (replaces ELO calculation)
CREATE OR REPLACE FUNCTION calculate_challenge_spa(
    winner_spa_balance INTEGER,
    loser_spa_balance INTEGER,
    bet_spa_points INTEGER
) RETURNS TABLE (
    winner_spa_change INTEGER,
    loser_spa_change INTEGER,
    spa_points_exchanged INTEGER
) AS $$
BEGIN
    -- Simple SPA point exchange: winner gets bet amount, loser loses bet amount
    RETURN QUERY
    SELECT 
        bet_spa_points as winner_spa_change,
        -bet_spa_points as loser_spa_change,
        bet_spa_points as spa_points_exchanged;
END;
$$ LANGUAGE plpgsql;

-- 4. Update process_challenge_result to use SPA instead of ELO
CREATE OR REPLACE FUNCTION process_challenge_result(
    p_challenge_id UUID,
    p_winner_id UUID,
    p_loser_id UUID,
    p_winner_score INTEGER,
    p_loser_score INTEGER
) RETURNS VOID AS $$
DECLARE
    v_challenge challenges%ROWTYPE;
    v_winner_spa_balance INTEGER;
    v_loser_spa_balance INTEGER;
    v_winner_spa_change INTEGER;
    v_loser_spa_change INTEGER;
    v_spa_points_exchanged INTEGER;
BEGIN
    -- Get challenge details
    SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Challenge not found';
    END IF;
    
    -- Get current SPA balances from player_rankings
    SELECT COALESCE(spa_points, 0) INTO v_winner_spa_balance 
    FROM player_rankings WHERE user_id = p_winner_id;
    
    SELECT COALESCE(spa_points, 0) INTO v_loser_spa_balance 
    FROM player_rankings WHERE user_id = p_loser_id;
    
    -- Validate that loser has enough SPA points
    IF v_loser_spa_balance < v_challenge.bet_points THEN
        RAISE EXCEPTION 'Loser does not have enough SPA points for bet';
    END IF;
    
    -- Calculate SPA changes
    SELECT winner_spa_change, loser_spa_change, spa_points_exchanged
    INTO v_winner_spa_change, v_loser_spa_change, v_spa_points_exchanged
    FROM calculate_challenge_spa(v_winner_spa_balance, v_loser_spa_balance, v_challenge.bet_points);
    
    -- Insert challenge result with SPA data
    INSERT INTO challenge_results (
        challenge_id, winner_id, loser_id, winner_score, loser_score,
        spa_points_exchanged, winner_spa_change, loser_spa_change
    ) VALUES (
        p_challenge_id, p_winner_id, p_loser_id, p_winner_score, p_loser_score,
        v_spa_points_exchanged, v_winner_spa_change, v_loser_spa_change
    );
    
    -- Update challenge status
    UPDATE challenges 
    SET 
        status = 'completed',
        winner_id = p_winner_id,
        challenger_score = CASE WHEN p_winner_id = challenger_id THEN p_winner_score ELSE p_loser_score END,
        opponent_score = CASE WHEN p_winner_id = opponent_id THEN p_winner_score ELSE p_loser_score END,
        actual_end_time = NOW(),
        updated_at = NOW()
    WHERE id = p_challenge_id;
    
    -- Update SPA points in player_rankings (NOT ELO points)
    UPDATE player_rankings 
    SET spa_points = spa_points + v_winner_spa_change,
        updated_at = NOW()
    WHERE user_id = p_winner_id;
    
    UPDATE player_rankings 
    SET spa_points = spa_points + v_loser_spa_change,
        updated_at = NOW()
    WHERE user_id = p_loser_id;
    
    -- Log SPA transactions
    INSERT INTO spa_transactions (user_id, amount, transaction_type, reference_id, description)
    VALUES (
        p_winner_id, 
        v_winner_spa_change, 
        'challenge_win', 
        p_challenge_id::text,
        'Won challenge bet: +' || v_winner_spa_change || ' SPA'
    );
    
    INSERT INTO spa_transactions (user_id, amount, transaction_type, reference_id, description)
    VALUES (
        p_loser_id, 
        v_loser_spa_change, 
        'challenge_loss', 
        p_challenge_id::text,
        'Lost challenge bet: ' || v_loser_spa_change || ' SPA'
    );
    
    -- Update user match statistics (wins/losses count, but NO ELO changes)
    UPDATE user_profiles 
    SET wins = wins + 1,
        matches_played = matches_played + 1,
        updated_at = NOW()
    WHERE user_id = p_winner_id;
    
    UPDATE user_profiles 
    SET losses = losses + 1,
        matches_played = matches_played + 1,
        updated_at = NOW()
    WHERE user_id = p_loser_id;
    
    -- DO NOT update season_standings or club_standings with ELO points
    -- ELO points are only awarded through tournaments
    
    -- Optionally: Check and award challenge-related SPA milestones
    -- This could trigger milestone completion for challenge wins
    PERFORM check_spa_milestone_completion(p_winner_id, 'challenge_win');
END;
$$ LANGUAGE plpgsql;

-- 5. Drop the old ELO calculation function for challenges
DROP FUNCTION IF EXISTS calculate_challenge_elo(INTEGER, INTEGER, INTEGER);

-- 6. Update get_challenge_config function description to clarify SPA usage
CREATE OR REPLACE FUNCTION get_challenge_config(bet_points INTEGER)
RETURNS TABLE (
    race_to INTEGER,
    handicap_1_rank DECIMAL(3,1),
    handicap_05_rank DECIMAL(3,1),
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN bet_points = 600 THEN 22
            WHEN bet_points = 500 THEN 18
            WHEN bet_points = 400 THEN 16
            WHEN bet_points = 300 THEN 14
            WHEN bet_points = 200 THEN 12
            WHEN bet_points = 100 THEN 8
            ELSE 8
        END as race_to,
        CASE 
            WHEN bet_points = 600 THEN 3.5
            WHEN bet_points = 500 THEN 3.0
            WHEN bet_points = 400 THEN 2.5
            WHEN bet_points = 300 THEN 2.0
            WHEN bet_points = 200 THEN 1.5
            WHEN bet_points = 100 THEN 1.0
            ELSE 1.0
        END as handicap_1_rank,
        CASE 
            WHEN bet_points = 600 THEN 2.5
            WHEN bet_points = 500 THEN 2.0
            WHEN bet_points = 400 THEN 1.5
            WHEN bet_points = 300 THEN 1.5
            WHEN bet_points = 200 THEN 1.0
            WHEN bet_points = 100 THEN 0.5
            ELSE 0.5
        END as handicap_05_rank,
        CASE 
            WHEN bet_points = 600 THEN 'Thách đấu cao cấp - Race to 22'
            WHEN bet_points = 500 THEN 'Thách đấu trung cao - Race to 18'
            WHEN bet_points = 400 THEN 'Thách đấu trung cấp - Race to 16'
            WHEN bet_points = 300 THEN 'Thách đấu trung bình - Race to 14'
            WHEN bet_points = 200 THEN 'Thách đấu cơ bản - Race to 12'
            WHEN bet_points = 100 THEN 'Thách đấu sơ cấp - Race to 8'
            ELSE 'Thách đấu sơ cấp - Race to 8'
        END as description;
END;
$$ LANGUAGE plpgsql;

-- 7. Add comments to clarify the separation of ELO and SPA systems
COMMENT ON TABLE challenges IS 'Challenge system uses SPA points for betting. ELO points are only awarded through tournaments.';
COMMENT ON TABLE challenge_results IS 'Results track SPA point exchanges, not ELO changes. ELO is tournament-only.';
COMMENT ON FUNCTION process_challenge_result IS 'Processes challenge completion with SPA point exchange. Does not affect ELO ratings.';
COMMENT ON FUNCTION calculate_challenge_spa IS 'Calculates SPA point exchange for challenge betting. Separate from ELO system.';

-- 8. Create function to validate SPA betting balance before challenge creation
CREATE OR REPLACE FUNCTION validate_challenge_spa_balance(
    p_user_id UUID,
    p_bet_amount INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_spa_balance INTEGER;
BEGIN
    SELECT COALESCE(spa_points, 0) INTO v_spa_balance 
    FROM player_rankings 
    WHERE user_id = p_user_id;
    
    RETURN v_spa_balance >= p_bet_amount;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_challenge_spa_balance IS 'Validates that user has sufficient SPA points for challenge betting';
