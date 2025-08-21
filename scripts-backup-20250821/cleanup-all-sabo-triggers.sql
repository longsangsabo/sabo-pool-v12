-- ============================================
-- CLEANUP ALL CONFLICTING SABO TRIGGERS
-- ============================================
-- Problem: Multiple triggers causing duplicate advancement
-- Solution: Remove ALL and keep only ONE clean trigger

-- 1. Drop ALL existing triggers on tournament_matches
DROP TRIGGER IF EXISTS sabo_semifinals_auto_population ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_sabo_match_completion ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS sabo_auto_advancement ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination_v9 ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_advance_double_elimination ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS update_tournament_matches_updated_at ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS notify_winner_advancement_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_advance_double_elimination ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS trigger_update_tournament_matches_updated_at ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS auto_advance_double_elimination_trigger ON tournament_matches CASCADE;
DROP TRIGGER IF EXISTS tournament_match_winner_trigger ON tournament_matches CASCADE;

-- 2. Drop ALL related functions
DROP FUNCTION IF EXISTS auto_populate_sabo_semifinals() CASCADE;
DROP FUNCTION IF EXISTS handle_sabo_match_completion() CASCADE;
DROP FUNCTION IF EXISTS auto_advance_sabo_match() CASCADE;

-- 3. Create ONE CLEAN trigger for SABO advancement
CREATE OR REPLACE FUNCTION sabo_clean_advancement()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_type text;
  v_winner_id uuid;
  v_loser_id uuid;
BEGIN
  -- Only process completed matches with winners
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
     (OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
    
    -- Get tournament type
    SELECT tournament_type INTO v_tournament_type 
    FROM tournaments WHERE id = NEW.tournament_id;
    
    -- Handle SABO double elimination tournaments ONLY
    IF v_tournament_type = 'double_elimination' THEN
      v_winner_id := NEW.winner_id;
      v_loser_id := CASE WHEN NEW.player1_id = NEW.winner_id THEN NEW.player2_id ELSE NEW.player1_id END;
      
      -- ========== WINNERS BRACKET ==========
      IF NEW.round_number = 1 THEN
        -- R1 Winner → R2
        UPDATE tournament_matches 
        SET player1_id = CASE WHEN NEW.match_number % 2 = 1 THEN v_winner_id ELSE player1_id END,
            player2_id = CASE WHEN NEW.match_number % 2 = 0 THEN v_winner_id ELSE player2_id END,
            status = CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 2 
          AND match_number = CEIL(NEW.match_number::numeric / 2);
          
        -- R1 Loser → Losers R101
        UPDATE tournament_matches 
        SET player1_id = CASE WHEN NEW.match_number % 2 = 1 THEN v_loser_id ELSE player1_id END,
            player2_id = CASE WHEN NEW.match_number % 2 = 0 THEN v_loser_id ELSE player2_id END,
            status = CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 101 
          AND match_number = CEIL(NEW.match_number::numeric / 2);
          
      ELSIF NEW.round_number = 2 THEN
        -- R2 Winner → R3
        UPDATE tournament_matches 
        SET player1_id = CASE WHEN NEW.match_number % 2 = 1 THEN v_winner_id ELSE player1_id END,
            player2_id = CASE WHEN NEW.match_number % 2 = 0 THEN v_winner_id ELSE player2_id END,
            status = CASE WHEN player1_id IS NOT NULL AND player2_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 3 
          AND match_number = CEIL(NEW.match_number::numeric / 2);
          
        -- R2 Loser → Losers R102
        UPDATE tournament_matches 
        SET player2_id = v_loser_id,
            status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE status END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 102 
          AND match_number = NEW.match_number;
          
      ELSIF NEW.round_number = 3 THEN
        -- R3 Winners → Semifinals Player1
        IF NEW.match_number = 1 THEN
          UPDATE tournament_matches 
          SET player1_id = v_winner_id,
              status = CASE WHEN player2_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 250 
            AND match_number = 1;
        ELSIF NEW.match_number = 2 THEN
          UPDATE tournament_matches 
          SET player1_id = v_winner_id,
              status = CASE WHEN player2_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 250 
            AND match_number = 2;
        END IF;
      END IF;
      
      -- ========== LOSERS BRACKET ==========
      -- Losers A Champion (R103) → SF1 Player2
      IF NEW.round_number = 103 AND NEW.match_number = 1 THEN
        UPDATE tournament_matches 
        SET player2_id = v_winner_id,
            status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 1;
      END IF;
      
      -- Losers B Champion (R202) → SF2 Player2
      IF NEW.round_number = 202 AND NEW.match_number = 1 THEN
        UPDATE tournament_matches 
        SET player2_id = v_winner_id,
            status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
        WHERE tournament_id = NEW.tournament_id 
          AND round_number = 250 
          AND match_number = 2;
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
        ELSIF NEW.match_number = 2 THEN
          -- SF2 Winner → Grand Final Player2
          UPDATE tournament_matches 
          SET player2_id = v_winner_id,
              status = CASE WHEN player1_id IS NOT NULL THEN 'pending' ELSE 'waiting_for_players' END
          WHERE tournament_id = NEW.tournament_id 
            AND round_number = 300 
            AND match_number = 1;
        END IF;
      END IF;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Install the ONE clean trigger
CREATE TRIGGER sabo_clean_advancement_trigger
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION sabo_clean_advancement();

-- ============================================
-- CLEANUP COMPLETE - ONLY ONE TRIGGER NOW
-- ============================================
-- ✅ All conflicting triggers removed
-- ✅ All conflicting functions removed
-- ✅ One clean trigger installed
-- ✅ No more duplicate advancement!
-- ============================================
