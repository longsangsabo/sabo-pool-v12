-- Fix SABO-32 Advancement Logic
-- Add logic to advance losers from Winners Round 2 to Losers Branch B

CREATE OR REPLACE FUNCTION advance_sabo32_match_fixed(
    p_match_id UUID,
    p_winner_id UUID,
    p_score_player1 INTEGER,
    p_score_player2 INTEGER
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_match RECORD;
    v_loser_id UUID;
    v_updates_made INTEGER := 0;
    v_next_match RECORD;
    v_loser_branch_match RECORD;
BEGIN
    -- Get match details
    SELECT * INTO v_match 
    FROM sabo32_matches 
    WHERE id = p_match_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Match not found');
    END IF;
    
    -- Update match result
    UPDATE sabo32_matches 
    SET 
        winner_id = p_winner_id,
        score_player1 = p_score_player1,
        score_player2 = p_score_player2,
        status = 'completed',
        updated_at = NOW()
    WHERE id = p_match_id;
    
    v_updates_made := v_updates_made + 1;
    
    -- Determine loser
    v_loser_id := CASE 
        WHEN p_winner_id = v_match.player1_id THEN v_match.player2_id
        ELSE v_match.player1_id
    END;
    
    -- SABO-32 Advancement Logic
    IF v_match.bracket_type LIKE '%_winners' THEN
        -- Winners bracket advancement
        
        -- Advance winner to next winners round
        SELECT * INTO v_next_match
        FROM sabo32_matches
        WHERE tournament_id = v_match.tournament_id
        AND group_id = v_match.group_id
        AND bracket_type = v_match.bracket_type
        AND round_number = v_match.round_number + 1
        AND (
            (v_match.match_number % 2 = 1 AND match_number = (v_match.match_number + 1) / 2) OR
            (v_match.match_number % 2 = 0 AND match_number = v_match.match_number / 2)
        );
        
        IF FOUND THEN
            IF v_next_match.player1_id IS NULL THEN
                UPDATE sabo32_matches 
                SET player1_id = p_winner_id, updated_at = NOW()
                WHERE id = v_next_match.id;
                v_updates_made := v_updates_made + 1;
            ELSIF v_next_match.player2_id IS NULL THEN
                UPDATE sabo32_matches 
                SET player2_id = p_winner_id, updated_at = NOW()
                WHERE id = v_next_match.id;
                v_updates_made := v_updates_made + 1;
            END IF;
        END IF;
        
        -- 🎯 KEY FIX: Advance loser to appropriate losers bracket
        IF v_match.round_number = 1 THEN
            -- Round 1 losers go to Losers Branch A
            SELECT * INTO v_loser_branch_match
            FROM sabo32_matches
            WHERE tournament_id = v_match.tournament_id
            AND group_id = v_match.group_id
            AND bracket_type = REPLACE(v_match.bracket_type, '_winners', '_losers_a')
            AND round_number = 101
            AND (player1_id IS NULL OR player2_id IS NULL)
            ORDER BY match_number
            LIMIT 1;
            
        ELSIF v_match.round_number = 2 THEN
            -- 🔥 Round 2 losers go to Losers Branch B
            SELECT * INTO v_loser_branch_match
            FROM sabo32_matches
            WHERE tournament_id = v_match.tournament_id
            AND group_id = v_match.group_id
            AND bracket_type = REPLACE(v_match.bracket_type, '_winners', '_losers_b')
            AND round_number = 201
            AND (player1_id IS NULL OR player2_id IS NULL)
            ORDER BY match_number
            LIMIT 1;
            
        ELSIF v_match.round_number = 3 THEN
            -- Round 3 loser goes to Group Final (if exists)
            SELECT * INTO v_loser_branch_match
            FROM sabo32_matches
            WHERE tournament_id = v_match.tournament_id
            AND group_id = v_match.group_id
            AND bracket_type = REPLACE(v_match.bracket_type, '_winners', '_final')
            AND (player1_id IS NULL OR player2_id IS NULL)
            LIMIT 1;
        END IF;
        
        -- Place loser in appropriate bracket
        IF v_loser_branch_match.id IS NOT NULL THEN
            IF v_loser_branch_match.player1_id IS NULL THEN
                UPDATE sabo32_matches 
                SET player1_id = v_loser_id, updated_at = NOW()
                WHERE id = v_loser_branch_match.id;
                v_updates_made := v_updates_made + 1;
            ELSIF v_loser_branch_match.player2_id IS NULL THEN
                UPDATE sabo32_matches 
                SET player2_id = v_loser_id, updated_at = NOW()
                WHERE id = v_loser_branch_match.id;
                v_updates_made := v_updates_made + 1;
            END IF;
        END IF;
        
    ELSIF v_match.bracket_type LIKE '%_losers_a' THEN
        -- Losers Branch A advancement
        SELECT * INTO v_next_match
        FROM sabo32_matches
        WHERE tournament_id = v_match.tournament_id
        AND group_id = v_match.group_id
        AND bracket_type = v_match.bracket_type
        AND round_number = v_match.round_number + 1
        AND (player1_id IS NULL OR player2_id IS NULL)
        ORDER BY match_number
        LIMIT 1;
        
        IF FOUND THEN
            IF v_next_match.player1_id IS NULL THEN
                UPDATE sabo32_matches 
                SET player1_id = p_winner_id, updated_at = NOW()
                WHERE id = v_next_match.id;
                v_updates_made := v_updates_made + 1;
            ELSIF v_next_match.player2_id IS NULL THEN
                UPDATE sabo32_matches 
                SET player2_id = p_winner_id, updated_at = NOW()
                WHERE id = v_next_match.id;
                v_updates_made := v_updates_made + 1;
            END IF;
        END IF;
        
    ELSIF v_match.bracket_type LIKE '%_losers_b' THEN
        -- Losers Branch B advancement
        SELECT * INTO v_next_match
        FROM sabo32_matches
        WHERE tournament_id = v_match.tournament_id
        AND group_id = v_match.group_id
        AND bracket_type = v_match.bracket_type
        AND round_number = v_match.round_number + 1
        AND (player1_id IS NULL OR player2_id IS NULL)
        ORDER BY match_number
        LIMIT 1;
        
        IF FOUND THEN
            IF v_next_match.player1_id IS NULL THEN
                UPDATE sabo32_matches 
                SET player1_id = p_winner_id, updated_at = NOW()
                WHERE id = v_next_match.id;
                v_updates_made := v_updates_made + 1;
            ELSIF v_next_match.player2_id IS NULL THEN
                UPDATE sabo32_matches 
                SET player2_id = p_winner_id, updated_at = NOW()
                WHERE id = v_next_match.id;
                v_updates_made := v_updates_made + 1;
            END IF;
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'updates_made', v_updates_made,
        'match_id', p_match_id,
        'winner_id', p_winner_id,
        'loser_id', v_loser_id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', format('Advancement failed: %s', SQLERRM),
        'match_id', p_match_id
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION advance_sabo32_match_fixed(UUID, UUID, INTEGER, INTEGER) TO authenticated;

SELECT 'SABO-32 advancement function created successfully' as status;
