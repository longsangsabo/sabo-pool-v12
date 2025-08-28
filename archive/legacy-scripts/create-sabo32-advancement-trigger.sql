-- SABO32 Auto-Advancement Trigger Function
-- Handles automatic advancement for SABO-32 tournament structure

CREATE OR REPLACE FUNCTION handle_sabo32_match_completion()
RETURNS TRIGGER AS $$
DECLARE
    loser_id TEXT;
    winner_id TEXT;
    tournament_id TEXT;
    group_id TEXT;
    bracket_type TEXT;
    debug_msg TEXT := '';
BEGIN
    -- Only process completed matches with winners
    IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
       (OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
        
        winner_id := NEW.winner_id;
        tournament_id := NEW.tournament_id;
        group_id := NEW.group_id;
        bracket_type := NEW.bracket_type;
        
        -- Determine loser
        loser_id := CASE 
            WHEN NEW.player1_id = NEW.winner_id THEN NEW.player2_id
            ELSE NEW.player1_id
        END;
        
        debug_msg := 'Processing match completion: ' || NEW.sabo_match_id;
        RAISE NOTICE '%', debug_msg;
        
        -- GROUP A/B WINNERS BRACKET ADVANCEMENT
        IF bracket_type IN ('GROUP_A_WINNERS', 'GROUP_B_WINNERS') THEN
            -- Advance winner to next winners round (if exists)
            UPDATE sabo32_matches 
            SET player1_id = COALESCE(player1_id, winner_id),
                player2_id = CASE WHEN player1_id IS NOT NULL THEN winner_id ELSE player2_id END
            WHERE tournament_id = NEW.tournament_id
            AND group_id = NEW.group_id
            AND bracket_type = NEW.bracket_type
            AND round_number = NEW.round_number + 1
            AND (player1_id IS NULL OR player2_id IS NULL);
            
            IF FOUND THEN
                RAISE NOTICE 'Advanced winner % to next winners round', winner_id;
            END IF;
            
            -- Send loser to losers bracket (only for Round 1)
            IF NEW.round_number = 1 THEN
                UPDATE sabo32_matches 
                SET player1_id = COALESCE(player1_id, loser_id),
                    player2_id = CASE WHEN player1_id IS NOT NULL THEN loser_id ELSE player2_id END
                WHERE tournament_id = NEW.tournament_id
                AND group_id = NEW.group_id
                AND bracket_type = CONCAT('GROUP_', NEW.group_id, '_LOSERS_A')
                AND round_number = 101
                AND (player1_id IS NULL OR player2_id IS NULL);
                
                IF FOUND THEN
                    RAISE NOTICE 'Sent loser % to losers bracket', loser_id;
                END IF;
            END IF;
        END IF;
        
        -- GROUP A/B LOSERS BRACKET ADVANCEMENT
        IF bracket_type IN ('GROUP_A_LOSERS_A', 'GROUP_B_LOSERS_A', 'GROUP_A_LOSERS_B', 'GROUP_B_LOSERS_B') THEN
            -- Advance winner to next losers round
            UPDATE sabo32_matches 
            SET player1_id = COALESCE(player1_id, winner_id),
                player2_id = CASE WHEN player1_id IS NOT NULL THEN winner_id ELSE player2_id END
            WHERE tournament_id = NEW.tournament_id
            AND group_id = NEW.group_id
            AND bracket_type = NEW.bracket_type
            AND round_number = NEW.round_number + 1
            AND (player1_id IS NULL OR player2_id IS NULL);
            
            IF FOUND THEN
                RAISE NOTICE 'Advanced losers bracket winner % to next round', winner_id;
            END IF;
        END IF;
        
        -- GROUP FINALS TO CROSS-BRACKET
        IF bracket_type IN ('GROUP_A_FINAL', 'GROUP_B_FINAL') THEN
            -- Winner to cross-semifinals (Winner A vs Runner-up B, Winner B vs Runner-up A)
            IF NEW.group_id = 'A' THEN
                -- Group A winner to SF1 player1
                UPDATE sabo32_matches 
                SET player1_id = winner_id
                WHERE tournament_id = NEW.tournament_id
                AND group_id IS NULL
                AND bracket_type = 'CROSS_SEMIFINALS'
                AND sabo_match_id = 'SF1'
                AND player1_id IS NULL;
                
                -- Group A runner-up to SF2 player2  
                UPDATE sabo32_matches 
                SET player2_id = loser_id
                WHERE tournament_id = NEW.tournament_id
                AND group_id IS NULL
                AND bracket_type = 'CROSS_SEMIFINALS'
                AND sabo_match_id = 'SF2'
                AND player2_id IS NULL;
                
            ELSIF NEW.group_id = 'B' THEN
                -- Group B winner to SF2 player1
                UPDATE sabo32_matches 
                SET player1_id = winner_id
                WHERE tournament_id = NEW.tournament_id
                AND group_id IS NULL
                AND bracket_type = 'CROSS_SEMIFINALS'
                AND sabo_match_id = 'SF2'
                AND player1_id IS NULL;
                
                -- Group B runner-up to SF1 player2
                UPDATE sabo32_matches 
                SET player2_id = loser_id
                WHERE tournament_id = NEW.tournament_id
                AND group_id IS NULL
                AND bracket_type = 'CROSS_SEMIFINALS'
                AND sabo_match_id = 'SF1'
                AND player2_id IS NULL;
            END IF;
            
            RAISE NOTICE 'Group % final completed: Winner % to cross-semifinals', NEW.group_id, winner_id;
        END IF;
        
        -- CROSS-SEMIFINALS TO FINAL
        IF bracket_type = 'CROSS_SEMIFINALS' THEN
            -- Advance winner to final
            UPDATE sabo32_matches 
            SET player1_id = COALESCE(player1_id, winner_id),
                player2_id = CASE WHEN player1_id IS NOT NULL THEN winner_id ELSE player2_id END
            WHERE tournament_id = NEW.tournament_id
            AND group_id IS NULL
            AND bracket_type = 'CROSS_FINAL'
            AND (player1_id IS NULL OR player2_id IS NULL);
            
            IF FOUND THEN
                RAISE NOTICE 'Cross-semifinal winner % advanced to final', winner_id;
            END IF;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sabo32_auto_advancement_trigger ON sabo32_matches;

CREATE TRIGGER sabo32_auto_advancement_trigger
    AFTER UPDATE ON sabo32_matches
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND NEW.winner_id IS NOT NULL)
    EXECUTE FUNCTION handle_sabo32_match_completion();

-- Test the trigger
SELECT 'SABO32 auto-advancement trigger created successfully' as status;
