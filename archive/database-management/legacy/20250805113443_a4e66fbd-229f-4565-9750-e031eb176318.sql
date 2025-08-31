-- Drop function cũ và tạo lại
DROP FUNCTION IF EXISTS public.sabo_tournament_coordinator();
DROP TRIGGER IF EXISTS sabo_tournament_progression ON tournament_matches;

-- Tạo lại function sabo_tournament_coordinator
CREATE OR REPLACE FUNCTION public.sabo_tournament_coordinator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match RECORD;
  v_loser_id UUID;
  v_winner_id UUID;
BEGIN
  -- Chỉ xử lý khi match vừa được completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.winner_id IS NOT NULL THEN
    v_match := NEW;
    v_winner_id := NEW.winner_id;
    
    -- Xác định loser
    v_loser_id := CASE 
      WHEN v_match.player1_id = v_winner_id THEN v_match.player2_id
      ELSE v_match.player1_id 
    END;
    
    -- SABO ADVANCEMENT LOGIC dựa trên round_number
    CASE v_match.round_number
      -- WINNERS BRACKET
      WHEN 1 THEN
        -- Winner to R2, Loser to R101 (Branch A)
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 2, v_winner_id);
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 101, v_loser_id);
        
      WHEN 2 THEN  
        -- Winner to R3, Loser to R201 (Branch B)
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 3, v_winner_id);
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 201, v_loser_id);
        
      WHEN 3 THEN
        -- Winner to R250 (Semifinals), Loser eliminated
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 250, v_winner_id);
        
      -- LOSERS BRANCH A
      WHEN 101 THEN
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 102, v_winner_id);
        
      WHEN 102 THEN
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 103, v_winner_id);
        
      WHEN 103 THEN
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 250, v_winner_id);
        
      -- LOSERS BRANCH B  
      WHEN 201 THEN
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 202, v_winner_id);
        
      WHEN 202 THEN
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 250, v_winner_id);
        
      -- SEMIFINALS
      WHEN 250 THEN
        PERFORM assign_participant_to_next_match(v_match.tournament_id, 300, v_winner_id);
        
      -- FINAL
      WHEN 300 THEN
        -- Tournament complete
        UPDATE tournaments 
        SET status = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE id = v_match.tournament_id;
        
      ELSE
        -- Invalid round, log nhưng không fail
        RAISE NOTICE 'Unknown SABO round: %', v_match.round_number;
    END CASE;
    
    -- Update match status để trigger next rounds
    PERFORM update_double_elimination_match_status(v_match.tournament_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Tạo trigger mới cho SABO tournament progression
CREATE TRIGGER sabo_tournament_progression
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION sabo_tournament_coordinator();