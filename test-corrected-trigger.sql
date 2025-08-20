-- Test corrected tournament results trigger với schema đã sửa
-- Column đã đổi từ total_matches -> matches_played

-- Test các function riêng lẻ trước
SELECT 'Testing calculate_player_tournament_stats...' as test_step;

-- Test function calculate_player_tournament_stats
DO $$
DECLARE
    v_tournament_id uuid;
    v_user_id uuid;
    v_stats record;
BEGIN
    -- Lấy tournament và user ID từ database thực
    SELECT id INTO v_tournament_id 
    FROM tournaments 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF v_tournament_id IS NULL THEN
        RAISE NOTICE 'No active tournament found for testing';
        RETURN;
    END IF;
    
    SELECT user_id INTO v_user_id 
    FROM tournament_registrations 
    WHERE tournament_id = v_tournament_id 
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No participants found for tournament %', v_tournament_id;
        RETURN;
    END IF;
    
    -- Test function
    SELECT * INTO v_stats 
    FROM calculate_player_tournament_stats(v_tournament_id, v_user_id);
    
    RAISE NOTICE 'Stats for user % in tournament %: matches_played=%, wins=%, losses=%, win_rate=%', 
        v_user_id, v_tournament_id, v_stats.matches_played, v_stats.wins, v_stats.losses, v_stats.win_percentage;
        
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error testing calculate_player_tournament_stats: %', SQLERRM;
END;
$$;

-- Test function manual completion
SELECT 'Testing manual_complete_tournament...' as test_step;

DO $$
DECLARE
    v_tournament_id uuid;
    v_final_match record;
BEGIN
    -- Lấy tournament có final match completed
    SELECT tm.tournament_id, tm.winner_id 
    INTO v_tournament_id, v_final_match
    FROM tournament_matches tm
    WHERE tm.round = 300 
      AND tm.status = 'completed'
      AND tm.winner_id IS NOT NULL
    LIMIT 1;
    
    IF v_tournament_id IS NULL THEN
        RAISE NOTICE 'No completed final match found for testing';
        RETURN;
    END IF;
    
    -- Test manual completion (dry run - commented out actual call)
    RAISE NOTICE 'Would call: SELECT manual_complete_tournament(%, %)', v_tournament_id, v_final_match.winner_id;
    -- SELECT manual_complete_tournament(v_tournament_id, v_final_match.winner_id);
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error testing manual_complete_tournament: %', SQLERRM;
END;
$$;

SELECT 'Test completed!' as result;
