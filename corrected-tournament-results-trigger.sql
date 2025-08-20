-- ============================================================================
-- TOURNAMENT RESULTS AUTO TRIGGER - CORRECTED VERSION
-- Trigger tự động ghi dữ liệu vào tournament_results sau khi final match hoàn thành
-- ============================================================================

-- 1. Function tính toán kết quả tournament cho từng user
CREATE OR REPLACE FUNCTION calculate_and_insert_tournament_results()
RETURNS TRIGGER AS $$
DECLARE
    tournament_uuid UUID;
    participant RECORD;
    winner_id UUID;
    runner_up_id UUID;
    participant_stats RECORD;
    final_position_counter INT := 3;
BEGIN
    -- Chỉ xử lý khi trận final (Round 300) vừa hoàn thành
    IF NEW.round_number != 300 OR NEW.status != 'completed' OR OLD.status = 'completed' THEN
        RETURN NEW;
    END IF;
    
    tournament_uuid := NEW.tournament_id;
    winner_id := NEW.winner_id;
    
    -- Xác định runner-up
    runner_up_id := CASE 
        WHEN NEW.winner_id = NEW.player1_id THEN NEW.player2_id
        ELSE NEW.player1_id
    END;
    
    -- Xóa kết quả cũ nếu có
    DELETE FROM tournament_results WHERE tournament_id = tournament_uuid;
    
    -- Tạo kết quả cho tất cả participants
    FOR participant IN 
        SELECT DISTINCT user_id 
        FROM tournament_registrations 
        WHERE tournament_id = tournament_uuid
    LOOP
        -- Tính toán thống kê matches của participant
        SELECT 
            COUNT(*) as matches_played,
            COUNT(CASE WHEN winner_id = participant.user_id THEN 1 END) as wins,
            COUNT(CASE WHEN winner_id IS NOT NULL AND winner_id != participant.user_id THEN 1 END) as losses
        INTO participant_stats
        FROM tournament_matches 
        WHERE tournament_id = tournament_uuid 
        AND (player1_id = participant.user_id OR player2_id = participant.user_id)
        AND status = 'completed';
        
        -- Insert kết quả vào tournament_results
        INSERT INTO tournament_results (
            tournament_id,
            user_id,
            final_position,
            matches_played,
            wins,
            losses,
            win_percentage,
            spa_points_earned,
            placement_type
        ) VALUES (
            tournament_uuid,
            participant.user_id,
            CASE 
                WHEN participant.user_id = winner_id THEN 1
                WHEN participant.user_id = runner_up_id THEN 2
                ELSE final_position_counter
            END,
            participant_stats.matches_played,
            participant_stats.wins,
            participant_stats.losses,
            CASE 
                WHEN participant_stats.matches_played > 0 
                THEN ROUND((participant_stats.wins::decimal / participant_stats.matches_played) * 100, 2)
                ELSE 0 
            END,
            CASE 
                WHEN participant.user_id = winner_id THEN 100
                WHEN participant.user_id = runner_up_id THEN 50
                ELSE 10
            END,
            CASE 
                WHEN participant.user_id = winner_id THEN 'champion'
                WHEN participant.user_id = runner_up_id THEN 'runner_up'
                ELSE 'participant'
            END
        );
        
        -- Tăng vị trí cho các participant khác
        IF participant.user_id != winner_id AND participant.user_id != runner_up_id THEN
            final_position_counter := final_position_counter + 1;
        END IF;
    END LOOP;
    
    -- Cập nhật tournament status
    UPDATE tournaments 
    SET 
        status = 'completed'
    WHERE id = tournament_uuid;
    
    RAISE NOTICE '🏆 Tournament % completed! Results generated automatically.', tournament_uuid;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Tạo trigger
DROP TRIGGER IF EXISTS trigger_auto_tournament_results ON tournament_matches;
CREATE TRIGGER trigger_auto_tournament_results
    AFTER UPDATE ON tournament_matches
    FOR EACH ROW
    EXECUTE FUNCTION calculate_and_insert_tournament_results();

-- 3. Manual completion function (nút backup)
CREATE OR REPLACE FUNCTION manual_complete_tournament(
    p_tournament_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_final_match RECORD;
    v_tournament_status text;
    v_result_count integer;
BEGIN
    -- Kiểm tra tournament status
    SELECT status INTO v_tournament_status 
    FROM tournaments 
    WHERE id = p_tournament_id;
    
    IF v_tournament_status = 'completed' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Tournament đã được hoàn thành rồi!'
        );
    END IF;
    
    -- Tìm final match
    SELECT * INTO v_final_match
    FROM tournament_matches 
    WHERE tournament_id = p_tournament_id 
        AND round_number = 300 
        AND match_number = 1;
    
    IF v_final_match IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Không tìm thấy trận final!'
        );
    END IF;
    
    -- Kiểm tra final match đã hoàn thành chưa
    IF v_final_match.status != 'completed' OR v_final_match.winner_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Trận final chưa hoàn thành!'
        );
    END IF;
    
    -- Kiểm tra đã có kết quả chưa
    SELECT COUNT(*) INTO v_result_count 
    FROM tournament_results 
    WHERE tournament_id = p_tournament_id;
    
    IF v_result_count > 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Tournament results đã tồn tại!'
        );
    END IF;
    
    -- Gọi trigger function để tạo kết quả
    PERFORM calculate_and_insert_tournament_results_manual(
        v_final_match.tournament_id,
        v_final_match.winner_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Tournament đã được hoàn thành thành công!'
    );
END;
$$;

-- 4. Manual helper function
CREATE OR REPLACE FUNCTION calculate_and_insert_tournament_results_manual(
    p_tournament_id uuid,
    p_winner_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    participant RECORD;
    runner_up_id UUID;
    participant_stats RECORD;
    final_position_counter INT := 3;
    v_final_match RECORD;
BEGIN
    -- Lấy thông tin final match
    SELECT * INTO v_final_match
    FROM tournament_matches 
    WHERE tournament_id = p_tournament_id 
        AND round_number = 300 
        AND match_number = 1;
    
    -- Xác định runner-up
    runner_up_id := CASE 
        WHEN v_final_match.winner_id = v_final_match.player1_id THEN v_final_match.player2_id
        ELSE v_final_match.player1_id
    END;
    
    -- Xóa kết quả cũ nếu có
    DELETE FROM tournament_results WHERE tournament_id = p_tournament_id;
    
    -- Tạo kết quả cho tất cả participants
    FOR participant IN 
        SELECT DISTINCT user_id 
        FROM tournament_registrations 
        WHERE tournament_id = p_tournament_id
    LOOP
        -- Tính toán thống kê matches của participant
        SELECT 
            COUNT(*) as matches_played,
            COUNT(CASE WHEN winner_id = participant.user_id THEN 1 END) as wins,
            COUNT(CASE WHEN winner_id IS NOT NULL AND winner_id != participant.user_id THEN 1 END) as losses
        INTO participant_stats
        FROM tournament_matches 
        WHERE tournament_id = p_tournament_id 
        AND (player1_id = participant.user_id OR player2_id = participant.user_id)
        AND status = 'completed';
        
        -- Insert kết quả vào tournament_results
        INSERT INTO tournament_results (
            tournament_id,
            user_id,
            final_position,
            matches_played,
            wins,
            losses,
            win_percentage,
            spa_points_earned,
            placement_type
        ) VALUES (
            p_tournament_id,
            participant.user_id,
            CASE 
                WHEN participant.user_id = p_winner_id THEN 1
                WHEN participant.user_id = runner_up_id THEN 2
                ELSE final_position_counter
            END,
            participant_stats.matches_played,
            participant_stats.wins,
            participant_stats.losses,
            CASE 
                WHEN participant_stats.matches_played > 0 
                THEN ROUND((participant_stats.wins::decimal / participant_stats.matches_played) * 100, 2)
                ELSE 0 
            END,
            CASE 
                WHEN participant.user_id = p_winner_id THEN 100
                WHEN participant.user_id = runner_up_id THEN 50
                ELSE 10
            END,
            CASE 
                WHEN participant.user_id = p_winner_id THEN 'champion'
                WHEN participant.user_id = runner_up_id THEN 'runner_up'
                ELSE 'participant'
            END
        );
        
        -- Tăng vị trí cho các participant khác
        IF participant.user_id != p_winner_id AND participant.user_id != runner_up_id THEN
            final_position_counter := final_position_counter + 1;
        END IF;
    END LOOP;
    
    -- Cập nhật tournament status
    UPDATE tournaments 
    SET 
        status = 'completed'
    WHERE id = p_tournament_id;
    
    RAISE NOTICE '🏆 Tournament % completed manually!', p_tournament_id;
END;
$$;

-- 5. Test helper function
CREATE OR REPLACE FUNCTION test_tournament_results_trigger(
    p_tournament_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    test_tournament_id uuid;
    final_match RECORD;
    result_count integer;
BEGIN
    -- Sử dụng tournament_id được truyền vào hoặc tìm tournament đầu tiên
    IF p_tournament_id IS NULL THEN
        SELECT id INTO test_tournament_id 
        FROM tournaments 
        WHERE status != 'completed' 
        LIMIT 1;
    ELSE
        test_tournament_id := p_tournament_id;
    END IF;
    
    IF test_tournament_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Không tìm thấy tournament để test!'
        );
    END IF;
    
    -- Tìm final match
    SELECT * INTO final_match
    FROM tournament_matches 
    WHERE tournament_id = test_tournament_id 
        AND round_number = 300 
        AND match_number = 1;
    
    IF final_match IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Không tìm thấy final match!',
            'tournament_id', test_tournament_id
        );
    END IF;
    
    -- Kiểm tra số lượng results trước khi test
    SELECT COUNT(*) INTO result_count 
    FROM tournament_results 
    WHERE tournament_id = test_tournament_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Test data ready',
        'tournament_id', test_tournament_id,
        'final_match_id', final_match.id,
        'final_match_status', final_match.status,
        'winner_id', final_match.winner_id,
        'results_count_before', result_count
    );
END;
$$;

COMMENT ON FUNCTION calculate_and_insert_tournament_results() IS 'Auto-trigger khi final match completed';
COMMENT ON FUNCTION manual_complete_tournament(uuid) IS 'Manual completion button function';
COMMENT ON FUNCTION test_tournament_results_trigger(uuid) IS 'Test helper function';
