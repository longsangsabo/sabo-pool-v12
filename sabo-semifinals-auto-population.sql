-- ============================================
-- SABO SEMIFINALS AUTO-POPULATION SYSTEM
-- ============================================
-- Simple logic: Auto-fill Semifinals when R3 and Losers Finals complete

-- Function to auto-populate Semifinals
CREATE OR REPLACE FUNCTION auto_populate_sabo_semifinals()
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
    
    -- Handle SABO tournaments (double_elimination type)
    IF v_tournament_type = 'double_elimination' THEN
      v_winner_id := NEW.winner_id;
      
      -- ========== R3 WINNERS TO SEMIFINALS ==========
      IF NEW.round_number = 3 THEN
        IF NEW.match_number = 1 THEN
          -- R3 M1 Winner → SF1 Player1
          UPDATE tournament_matches 
          SET player1_id = v_winner_id,
              status = CASE WHEN player2_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 250 
            AND match_number = 1;
          RAISE NOTICE '🏆 R3 M1 Winner % → SF1 Player1', v_winner_id;
          
        ELSIF NEW.match_number = 2 THEN
          -- R3 M2 Winner → SF2 Player1
          UPDATE tournament_matches 
          SET player1_id = v_winner_id,
              status = CASE WHEN player2_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 250 
            AND match_number = 2;
          RAISE NOTICE '🏆 R3 M2 Winner % → SF2 Player1', v_winner_id;
        END IF;
      END IF;
      
      -- ========== LOSERS CHAMPIONS TO SEMIFINALS ==========
      -- Losers A Champion (R103) → SF1 Player2
      IF NEW.round_number = 103 AND NEW.match_number = 1 THEN
        UPDATE tournament_matches 
        SET player2_id = v_winner_id,
            status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 1;
        RAISE NOTICE '🏆 Losers A Champion % → SF1 Player2', v_winner_id;
      END IF;
      
      -- Losers B Champion (R202) → SF2 Player2
      IF NEW.round_number = 202 AND NEW.match_number = 1 THEN
        UPDATE tournament_matches 
        SET player2_id = v_winner_id,
            status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2;
        RAISE NOTICE '🏆 Losers B Champion % → SF2 Player2', v_winner_id;
      END IF;
      
      -- ========== SEMIFINALS TO GRAND FINAL ==========
      IF NEW.round_number = 250 THEN
        IF NEW.match_number = 1 THEN
          -- SF1 Winner → Grand Final Player1
          UPDATE tournament_matches 
          SET player1_id = v_winner_id,
              status = CASE WHEN player2_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 300 
            AND match_number = 1;
          RAISE NOTICE '🏆 SF1 Winner % → Grand Final Player1', v_winner_id;
          
        ELSIF NEW.match_number = 2 THEN
          -- SF2 Winner → Grand Final Player2
          UPDATE tournament_matches 
          SET player2_id = v_winner_id,
              status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 300 
            AND match_number = 1;
          RAISE NOTICE '🏆 SF2 Winner % → Grand Final Player2', v_winner_id;
        END IF;
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Install the trigger
DROP TRIGGER IF EXISTS sabo_semifinals_auto_population ON tournament_matches;
CREATE TRIGGER sabo_semifinals_auto_population
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_sabo_semifinals();

-- Manual fix function for existing tournaments
CREATE OR REPLACE FUNCTION fix_sabo_semifinals_now(p_tournament_id uuid)
RETURNS json AS $$
DECLARE
  v_r3m1_winner uuid;
  v_r3m2_winner uuid;
  v_losers_a_champion uuid;
  v_losers_b_champion uuid;
  v_result json := '{"fixed": []}';
  v_fixes text[] := array[]::text[];
BEGIN
  -- Get R3 winners
  SELECT winner_id INTO v_r3m1_winner FROM tournament_matches 
  WHERE tournament_id = p_tournament_id AND round_number = 3 AND match_number = 1 AND status = 'completed';
  
  SELECT winner_id INTO v_r3m2_winner FROM tournament_matches 
  WHERE tournament_id = p_tournament_id AND round_number = 3 AND match_number = 2 AND status = 'completed';
  
  -- Get Losers Champions
  SELECT winner_id INTO v_losers_a_champion FROM tournament_matches 
  WHERE tournament_id = p_tournament_id AND round_number = 103 AND match_number = 1 AND status = 'completed';
  
  SELECT winner_id INTO v_losers_b_champion FROM tournament_matches 
  WHERE tournament_id = p_tournament_id AND round_number = 202 AND match_number = 1 AND status = 'completed';
  
  -- Fix SF1
  IF v_r3m1_winner IS NOT NULL THEN
    UPDATE tournament_matches 
    SET player1_id = v_r3m1_winner
    WHERE tournament_id = p_tournament_id AND round_number = 250 AND match_number = 1;
    v_fixes := array_append(v_fixes, 'SF1 Player1: R3M1 Winner');
  END IF;
  
  IF v_losers_a_champion IS NOT NULL THEN
    UPDATE tournament_matches 
    SET player2_id = v_losers_a_champion
    WHERE tournament_id = p_tournament_id AND round_number = 250 AND match_number = 1;
    v_fixes := array_append(v_fixes, 'SF1 Player2: Losers A Champion');
  END IF;
  
  -- Fix SF2
  IF v_r3m2_winner IS NOT NULL THEN
    UPDATE tournament_matches 
    SET player1_id = v_r3m2_winner
    WHERE tournament_id = p_tournament_id AND round_number = 250 AND match_number = 2;
    v_fixes := array_append(v_fixes, 'SF2 Player1: R3M2 Winner');
  END IF;
  
  IF v_losers_b_champion IS NOT NULL THEN
    UPDATE tournament_matches 
    SET player2_id = v_losers_b_champion
    WHERE tournament_id = p_tournament_id AND round_number = 250 AND match_number = 2;
    v_fixes := array_append(v_fixes, 'SF2 Player2: Losers B Champion');
  END IF;
  
  -- Update match statuses
  UPDATE tournament_matches 
  SET status = CASE 
    WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'pending'
    ELSE 'waiting_for_players'
  END
  WHERE tournament_id = p_tournament_id AND round_number = 250;
  
  RETURN json_build_object('fixed', v_fixes, 'count', array_length(v_fixes, 1));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEMIFINALS AUTO-POPULATION SYSTEM READY
-- ============================================
-- ✅ R3M1 Winner → SF1 Player1
-- ✅ R3M2 Winner → SF2 Player1  
-- ✅ Losers A Champion (R103) → SF1 Player2
-- ✅ Losers B Champion (R202) → SF2 Player2
-- ✅ Auto-update match status to 'pending'
-- ✅ Manual fix function available
--
-- Usage:
-- SELECT fix_sabo_semifinals_now('tournament-id');
-- ============================================
