-- =============================================
-- FIX SABO-32 ADVANCEMENT LOGIC - SIMPLIFIED
-- Update players in next rounds based on completed matches
-- =============================================

CREATE OR REPLACE FUNCTION fix_sabo32_advancement(p_tournament_id TEXT)
RETURNS TEXT AS $$
DECLARE
    match_record RECORD;
    advancement_count INTEGER := 0;
    debug_output TEXT := '';
    loser_id TEXT;
    group_letter TEXT;
BEGIN
    debug_output := debug_output || 'Starting SABO-32 advancement fix for tournament: ' || p_tournament_id || E'\n';
    
    -- 1. WINNERS BRACKET ADVANCEMENT
    FOR match_record IN 
        SELECT * FROM sabo32_matches 
        WHERE tournament_id = p_tournament_id 
        AND bracket_type LIKE '%winners%' 
        AND status = 'completed' 
        AND winner_id IS NOT NULL
        ORDER BY group_id, round_number, match_number
    LOOP
        -- Find next winners match and advance winner
        UPDATE sabo32_matches 
        SET player1_id = CASE 
            WHEN match_record.match_number % 2 = 1 THEN match_record.winner_id
            ELSE player1_id 
        END,
        player2_id = CASE 
            WHEN match_record.match_number % 2 = 0 THEN match_record.winner_id
            ELSE player2_id 
        END
        WHERE tournament_id = p_tournament_id
        AND group_id = match_record.group_id
        AND bracket_type = match_record.bracket_type
        AND round_number = match_record.round_number + 1
        AND match_number = CEIL(match_record.match_number::DECIMAL / 2);
        
        IF FOUND THEN
            advancement_count := advancement_count + 1;
            debug_output := debug_output || 'Advanced winner from ' || match_record.sabo_match_id || ' to next winners round' || E'\n';
        END IF;
        
        -- Send loser to losers bracket (only for Round 1)
        IF match_record.round_number = 1 THEN
            loser_id := CASE 
                WHEN match_record.player1_id = match_record.winner_id THEN match_record.player2_id
                ELSE match_record.player1_id
            END;
            
            UPDATE sabo32_matches 
            SET player1_id = COALESCE(player1_id, loser_id),
                player2_id = CASE WHEN player1_id IS NOT NULL THEN loser_id ELSE player2_id END
            WHERE tournament_id = p_tournament_id
            AND group_id = match_record.group_id
            AND bracket_type = 'group_' || lower(match_record.group_id) || '_losers_a'
            AND round_number = 101
            AND (player1_id IS NULL OR player2_id IS NULL);
            
            IF FOUND THEN
                advancement_count := advancement_count + 1;
                debug_output := debug_output || 'Sent loser from ' || match_record.sabo_match_id || ' to losers bracket' || E'\n';
            END IF;
        END IF;
    END LOOP;
    
    -- 2. LOSERS BRACKET ADVANCEMENT
    FOR match_record IN 
        SELECT * FROM sabo32_matches 
        WHERE tournament_id = p_tournament_id 
        AND bracket_type LIKE '%losers%' 
        AND status = 'completed' 
        AND winner_id IS NOT NULL
        ORDER BY group_id, round_number, match_number
    LOOP
        -- Find next losers match
        UPDATE sabo32_matches 
        SET player1_id = COALESCE(player1_id, match_record.winner_id),
            player2_id = CASE WHEN player1_id IS NOT NULL THEN match_record.winner_id ELSE player2_id END
        WHERE tournament_id = p_tournament_id
        AND group_id = match_record.group_id
        AND bracket_type = match_record.bracket_type
        AND round_number = match_record.round_number + 1
        AND (player1_id IS NULL OR player2_id IS NULL);
        
        IF FOUND THEN
            advancement_count := advancement_count + 1;
            debug_output := debug_output || 'Advanced winner from losers ' || match_record.sabo_match_id || ' to next round' || E'\n';
        END IF;
    END LOOP;
    
    -- 3. GROUP FINALS TO CROSS-BRACKET
    FOR match_record IN 
        SELECT * FROM sabo32_matches 
        WHERE tournament_id = p_tournament_id 
        AND bracket_type LIKE '%final' 
        AND status = 'completed' 
        AND winner_id IS NOT NULL
        AND group_id IS NOT NULL
    LOOP
        group_letter := lower(match_record.group_id);
        loser_id := CASE 
            WHEN match_record.player1_id = match_record.winner_id THEN match_record.player2_id
            ELSE match_record.player1_id
        END;
        
        -- Winner to cross-semifinals
        UPDATE sabo32_matches 
        SET player1_id = match_record.winner_id
        WHERE tournament_id = p_tournament_id
        AND group_id IS NULL
        AND bracket_type = 'cross_semifinals'
        AND sabo_match_id = CASE WHEN group_letter = 'a' THEN 'SF1' ELSE 'SF2' END
        AND player1_id IS NULL;
        
        IF FOUND THEN
            advancement_count := advancement_count + 1;
            debug_output := debug_output || 'Group ' || match_record.group_id || ' winner to cross-semifinals' || E'\n';
        END IF;
        
        -- Runner-up to cross-semifinals
        UPDATE sabo32_matches 
        SET player2_id = loser_id
        WHERE tournament_id = p_tournament_id
        AND group_id IS NULL
        AND bracket_type = 'cross_semifinals'
        AND sabo_match_id = CASE WHEN group_letter = 'a' THEN 'SF2' ELSE 'SF1' END
        AND player2_id IS NULL;
        
        IF FOUND THEN
            advancement_count := advancement_count + 1;
            debug_output := debug_output || 'Group ' || match_record.group_id || ' runner-up to cross-semifinals' || E'\n';
        END IF;
    END LOOP;
    
    -- 4. CROSS-SEMIFINALS TO FINAL
    FOR match_record IN 
        SELECT * FROM sabo32_matches 
        WHERE tournament_id = p_tournament_id 
        AND bracket_type = 'cross_semifinals' 
        AND status = 'completed' 
        AND winner_id IS NOT NULL
    LOOP
        -- Send winner to final
        UPDATE sabo32_matches 
        SET player1_id = COALESCE(player1_id, match_record.winner_id),
            player2_id = CASE WHEN player1_id IS NOT NULL THEN match_record.winner_id ELSE player2_id END
        WHERE tournament_id = p_tournament_id
        AND group_id IS NULL
        AND bracket_type = 'cross_final'
        AND (player1_id IS NULL OR player2_id IS NULL);
        
        IF FOUND THEN
            advancement_count := advancement_count + 1;
            debug_output := debug_output || 'Cross-semifinal winner to final: ' || match_record.sabo_match_id || E'\n';
        END IF;
    END LOOP;
    
    debug_output := debug_output || 'SABO-32 advancement fix completed. Updates: ' || advancement_count;
    
    RETURN debug_output;
END;
$$ LANGUAGE plpgsql;
-- Example usage:
-- SELECT fix_sabo32_advancement('your-tournament-id-here');
