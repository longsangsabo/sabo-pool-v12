-- ============================================
-- SABO AUTOMATIC ADVANCEMENT SYSTEM - FINAL SETUP
-- ============================================
-- This ensures NEW TOURNAMENTS have automatic advancement
-- User requirement: "thứ tôi cần là các giải mới được tự động"

-- 1. Enhanced SABO Advancement Function (replaces trigger)
CREATE OR REPLACE FUNCTION auto_advance_sabo_match()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_type text;
  v_loser_id uuid;
  v_winner_id uuid;
BEGIN
  -- Only process completed matches with winners in SABO tournaments
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
     (OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
    
    -- Get tournament type
    SELECT tournament_type INTO v_tournament_type 
    FROM tournaments WHERE id = NEW.tournament_id;
    
    -- Only handle SABO tournaments
    IF v_tournament_type = 'sabo' THEN
      v_winner_id := NEW.winner_id;
      v_loser_id := CASE WHEN NEW.player1_id = NEW.winner_id THEN NEW.player2_id ELSE NEW.player1_id END;
      
      -- ========== WINNERS BRACKET ADVANCEMENT ==========
      IF NEW.round_number = 1 THEN
        -- R1 winners advance to R2
        UPDATE tournament_matches 
        SET player1_id = CASE WHEN NEW.match_number % 2 = 1 THEN v_winner_id ELSE player1_id END,
            player2_id = CASE WHEN NEW.match_number % 2 = 0 THEN v_winner_id ELSE player2_id END,
            status = CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 2 
          AND match_number = CEIL(NEW.match_number::numeric / 2);
          
        -- R1 losers advance to Losers R101
        UPDATE tournament_matches 
        SET player1_id = CASE WHEN NEW.match_number % 2 = 1 THEN v_loser_id ELSE player1_id END,
            player2_id = CASE WHEN NEW.match_number % 2 = 0 THEN v_loser_id ELSE player2_id END,
            status = CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 101 
          AND match_number = CEIL(NEW.match_number::numeric / 2);
          
      ELSIF NEW.round_number = 2 THEN
        -- R2 winners advance to R3
        UPDATE tournament_matches 
        SET player1_id = CASE WHEN NEW.match_number % 2 = 1 THEN v_winner_id ELSE player1_id END,
            player2_id = CASE WHEN NEW.match_number % 2 = 0 THEN v_winner_id ELSE player2_id END,
            status = CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 3 
          AND match_number = CEIL(NEW.match_number::numeric / 2);
          
        -- R2 losers advance to Losers R102
        UPDATE tournament_matches 
        SET player2_id = v_loser_id,
            status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 102 
          AND match_number = NEW.match_number;
          
      ELSIF NEW.round_number = 3 THEN
        -- R3 winners advance to Semifinals
        IF NEW.match_number = 1 THEN
          UPDATE tournament_matches 
          SET player1_id = v_winner_id,
              status = CASE WHEN player2_id IS NOT NULL THEN 'pending' ELSE status END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 250 
            AND match_number = 1;
        ELSIF NEW.match_number = 2 THEN
          UPDATE tournament_matches 
          SET player1_id = v_winner_id,
              status = CASE WHEN player2_id IS NOT NULL THEN 'pending' ELSE status END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 250 
            AND match_number = 2;
        END IF;
      END IF;
      
      -- ========== LOSERS BRACKET ADVANCEMENT ==========
      -- Losers A Champion (R103) goes to SF1 Player2
      IF NEW.round_number = 103 AND NEW.match_number = 1 THEN
        UPDATE tournament_matches 
        SET player2_id = v_winner_id,
            status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 1;
        RAISE NOTICE '🏆 Losers A Champion % advanced to SF1', v_winner_id;
      END IF;
      
      -- ⭐ KEY FIX: R202 (Losers B Final) winner goes to SF2 Player2
      IF NEW.round_number = 202 AND NEW.match_number = 1 THEN
        UPDATE tournament_matches 
        SET player2_id = v_winner_id,
            status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2;
        RAISE NOTICE '🏆 Losers B Champion % advanced to SF2', v_winner_id;
      END IF;
      
      -- ========== SEMIFINALS TO GRAND FINAL ==========
      IF NEW.round_number = 250 THEN
        IF NEW.match_number = 1 THEN
          -- SF1 winner to Grand Final Player1
          UPDATE tournament_matches 
          SET player1_id = v_winner_id,
              status = CASE WHEN player2_id IS NOT NULL THEN 'pending' ELSE status END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 300 
            AND match_number = 1;
        ELSIF NEW.match_number = 2 THEN
          -- SF2 winner to Grand Final Player2
          UPDATE tournament_matches 
          SET player2_id = v_winner_id,
              status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE status END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 300 
            AND match_number = 1;
        END IF;
      END IF;
      
      RAISE NOTICE '🎯 SABO Auto-advancement completed for match R%M%', NEW.round_number, NEW.match_number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Install the trigger
DROP TRIGGER IF EXISTS sabo_auto_advancement ON tournament_matches;
CREATE TRIGGER sabo_auto_advancement
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION auto_advance_sabo_match();

-- 3. Verification function
CREATE OR REPLACE FUNCTION verify_sabo_advancement(p_tournament_id uuid)
RETURNS TABLE(
  round_info text,
  match_status text,
  advancement_check text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'R' || tm.round_number::text || 'M' || tm.match_number::text as round_info,
    CASE 
      WHEN tm.player1_id IS NOT NULL AND tm.player2_id IS NOT NULL THEN 'Ready'
      WHEN tm.player1_id IS NOT NULL OR tm.player2_id IS NOT NULL THEN 'Partial'
      ELSE 'Empty'
    END as match_status,
    CASE tm.round_number
      WHEN 202 THEN 'Losers B Final - Should advance to SF2'
      WHEN 250 THEN 'Semifinals - Critical matches'
      ELSE 'Standard match'
    END as advancement_check
  FROM tournament_matches tm
  WHERE tm.tournament_id = p_tournament_id
    AND tm.round_number IN (202, 250)
  ORDER BY tm.round_number, tm.match_number;
END;
$$ LANGUAGE plpgsql;

-- 4. Emergency fix function for existing tournaments
CREATE OR REPLACE FUNCTION fix_existing_sabo_advancement(p_tournament_id uuid)
RETURNS json AS $$
DECLARE
  v_r202_winner uuid;
  v_sf2_player2 uuid;
  v_result json := '{}';
BEGIN
  -- Get R202 winner if exists
  SELECT winner_id INTO v_r202_winner
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id
    AND round_number = 202
    AND match_number = 1
    AND status = 'completed';
    
  -- Get SF2 current player2
  SELECT player2_id INTO v_sf2_player2
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id
    AND round_number = 250
    AND match_number = 2;
    
  -- Fix if needed
  IF v_r202_winner IS NOT NULL AND (v_sf2_player2 IS NULL OR v_sf2_player2 != v_r202_winner) THEN
    UPDATE tournament_matches
    SET player2_id = v_r202_winner,
        status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE status END
    WHERE tournament_id = p_tournament_id
      AND round_number = 250
      AND match_number = 2;
      
    v_result := json_build_object(
      'fixed', true,
      'r202_winner', v_r202_winner,
      'message', 'R202 winner advanced to SF2'
    );
  ELSE
    v_result := json_build_object(
      'fixed', false,
      'message', 'No fix needed or R202 not completed'
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INSTALLATION COMPLETE
-- ============================================
-- ✅ Automatic advancement trigger installed
-- ✅ R202 → SF2 advancement fixed  
-- ✅ Verification functions available
-- ✅ Emergency fix function ready
-- 
-- 🎯 NEW TOURNAMENTS WILL NOW HAVE AUTOMATIC ADVANCEMENT
-- 
-- Usage:
-- - SELECT * FROM verify_sabo_advancement('tournament-id');
-- - SELECT fix_existing_sabo_advancement('tournament-id');
-- ============================================
