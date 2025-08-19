-- Fixed SABO advancement trigger - handles R202 as Losers B Final
CREATE OR REPLACE FUNCTION handle_sabo_match_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_type text;
  v_next_round integer;
  v_next_match integer;
  v_is_odd_match boolean;
  v_update_field text;
  v_loser_id uuid;
BEGIN
  -- Only process if status changed to 'completed' and we have a winner
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
     (OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
    
    -- Get tournament type
    SELECT tournament_type INTO v_tournament_type 
    FROM tournaments WHERE id = NEW.tournament_id;
    
    -- Only handle SABO tournaments
    IF v_tournament_type = 'sabo' THEN
      
      -- Handle Winners Bracket advancement (R1, R2, R3)
      IF NEW.round_number BETWEEN 1 AND 2 THEN
        v_next_round := NEW.round_number + 1;
        v_next_match := CEIL(NEW.match_number::numeric / 2);
        v_is_odd_match := NEW.match_number % 2 = 1;
        v_update_field := CASE WHEN v_is_odd_match THEN 'player1_id' ELSE 'player2_id' END;
        
        -- Advance winner to next round
        EXECUTE format('UPDATE tournament_matches SET %I = $1 WHERE tournament_id = $2 AND round_number = $3 AND match_number = $4',
                      v_update_field)
        USING NEW.winner_id, NEW.tournament_id, v_next_round, v_next_match;
        
        -- Handle loser advancement to Losers Bracket
        v_loser_id := CASE WHEN NEW.player1_id = NEW.winner_id THEN NEW.player2_id ELSE NEW.player1_id END;
        
        IF NEW.round_number = 1 THEN
          -- R1 losers go to R101
          v_is_odd_match := NEW.match_number % 2 = 1;
          v_update_field := CASE WHEN v_is_odd_match THEN 'player1_id' ELSE 'player2_id' END;
          
          EXECUTE format('UPDATE tournament_matches SET %I = $1 WHERE tournament_id = $2 AND round_number = 101 AND match_number = $3',
                        v_update_field)
          USING v_loser_id, NEW.tournament_id, CEIL(NEW.match_number::numeric / 2);
          
        ELSIF NEW.round_number = 2 THEN
          -- R2 losers go to R102 (player2 position)
          UPDATE tournament_matches 
          SET player2_id = v_loser_id 
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 102 
            AND match_number = NEW.match_number;
        END IF;
      END IF;
      
      -- Handle Finals Stage advancement
      IF NEW.round_number = 3 THEN
        -- R3 winners go to Semifinals
        IF NEW.match_number = 1 THEN
          -- R3 M1 winner goes to SF1 player1
          UPDATE tournament_matches 
          SET player1_id = NEW.winner_id
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 250 
            AND match_number = 1;
        ELSIF NEW.match_number = 2 THEN
          -- R3 M2 winner goes to SF2 player1  
          UPDATE tournament_matches 
          SET player1_id = NEW.winner_id
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 250 
            AND match_number = 2;
        END IF;
      END IF;
      
      -- Handle Losers Finals advancement to Semifinals
      IF NEW.round_number = 103 AND NEW.match_number = 1 THEN
        -- Losers A Champion goes to SF1 player2
        UPDATE tournament_matches 
        SET player2_id = NEW.winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 1;
      END IF;
      
      -- FIXED: Handle R202 as Losers B Final
      IF NEW.round_number = 202 AND NEW.match_number = 1 THEN
        -- R202 winner (Losers B Champion) goes to SF2 player2
        UPDATE tournament_matches 
        SET player2_id = NEW.winner_id,
            status = 'pending'  -- Ensure SF2 becomes playable
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2;
          
        RAISE NOTICE '🎯 Auto-advanced Losers B Champion % to SF2', NEW.winner_id;
      END IF;
      
      -- Keep R203 handling for completeness (but R202 is the real Losers B Final in SABO)
      IF NEW.round_number = 203 AND NEW.match_number = 1 THEN
        -- Losers B Champion goes to SF2 player2
        UPDATE tournament_matches 
        SET player2_id = NEW.winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2;
      END IF;
      
      -- Handle Semifinals advancement to Grand Final
      IF NEW.round_number = 250 THEN
        IF NEW.match_number = 1 THEN
          -- SF1 winner goes to Grand Final player1
          UPDATE tournament_matches 
          SET player1_id = NEW.winner_id
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 300 
            AND match_number = 1;
        ELSIF NEW.match_number = 2 THEN
          -- SF2 winner goes to Grand Final player2
          UPDATE tournament_matches 
          SET player2_id = NEW.winner_id
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 300 
            AND match_number = 1;
        END IF;
      END IF;
      
      -- Auto-update match status to 'pending' when both players are assigned
      UPDATE tournament_matches 
      SET status = 'pending'
      WHERE tournament_id = NEW.tournament_id 
        AND status = 'waiting_for_players'
        AND player1_id IS NOT NULL 
        AND player2_id IS NOT NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_sabo_match_completion ON tournament_matches;

-- Create the trigger
CREATE TRIGGER trigger_sabo_match_completion
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION handle_sabo_match_completion();
