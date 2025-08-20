
-- Disable all conflicting triggers first
DROP TRIGGER IF EXISTS sabo_semifinals_auto_population ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_sabo_match_completion ON tournament_matches CASCADE;  
DROP TRIGGER IF EXISTS sabo_auto_advancement ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS sabo_master_advancement_trigger ON tournament_matches CASCADE;

-- Create a minimal, conflict-free advancement function
CREATE OR REPLACE FUNCTION sabo_clean_advancement_only()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_type text;
  v_winner_id uuid;
BEGIN
  -- Only process completed matches with winners
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
     (OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
    
    -- Get tournament type
    SELECT tournament_type INTO v_tournament_type 
    FROM tournaments WHERE id = NEW.tournament_id;
    
    -- Handle double elimination tournaments ONLY with basic advancement
    IF v_tournament_type = 'double_elimination' THEN
      v_winner_id := NEW.winner_id;
      
      -- Only handle critical semifinals advancement (simplified)
      IF NEW.round_number = 3 AND NEW.match_number = 1 THEN
        -- R3M1 Winner → SF1 Player1 (with conflict check)
        UPDATE tournament_matches 
        SET player1_id = v_winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 1
          AND (player1_id IS NULL OR player1_id != v_winner_id);
      END IF;
      
      IF NEW.round_number = 3 AND NEW.match_number = 2 THEN
        -- R3M2 Winner → SF2 Player1 (with conflict check)  
        UPDATE tournament_matches 
        SET player1_id = v_winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2
          AND (player1_id IS NULL OR player1_id != v_winner_id);
      END IF;
      
      IF NEW.round_number = 103 AND NEW.match_number = 1 THEN
        -- Losers A Champion → SF1 Player2 (with conflict check)
        UPDATE tournament_matches 
        SET player2_id = v_winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 1
          AND (player2_id IS NULL OR player2_id != v_winner_id);
      END IF;
      
      IF NEW.round_number = 202 AND NEW.match_number = 1 THEN
        -- Losers B Champion → SF2 Player2 (with conflict check)
        UPDATE tournament_matches 
        SET player2_id = v_winner_id
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2
          AND (player2_id IS NULL OR player2_id != v_winner_id);
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Install the clean trigger
CREATE TRIGGER sabo_clean_advancement_only_trigger
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION sabo_clean_advancement_only();
