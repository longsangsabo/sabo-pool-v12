-- 🚨 COMPREHENSIVE DOUBLE ELIMINATION SYSTEM FIX
-- Step 1: Create Test Tournament "new3" with 16 players

-- First, create the tournament
INSERT INTO tournaments (
  id,
  name,
  description,
  tournament_type,
  game_format,
  tier_level,
  max_participants,
  current_participants,
  registration_start,
  registration_end,
  tournament_start,
  tournament_end,
  venue_address,
  entry_fee,
  prize_pool,
  status,
  created_by,
  created_at,
  updated_at,
  has_third_place_match
) VALUES (
  gen_random_uuid(),
  'new3',
  'Test Double Elimination Tournament for System Verification',
  'double_elimination',
  'single_set',
  1,
  16,
  16,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '1 day', 
  NOW(),
  NOW() + INTERVAL '7 days',
  'Test Venue',
  50000,
  1000000,
  'ongoing',
  'd7d6ce12-490f-4fff-b913-80044de5e169',
  NOW(),
  NOW(),
  true
);

-- Get the tournament ID for use in subsequent operations
DO $$
DECLARE
  v_tournament_id UUID;
  v_player_ids UUID[] := ARRAY[
    'd7d6ce12-490f-4fff-b913-80044de5e169',
    '4bedc2fd-a85d-483d-80e5-c9541d6ecdc2',
    '1b20b730-51f7-4a58-9d14-ca168a51be99',
    '4aa58392-9e4d-42fc-a9ef-7b031c8279db',
    '519cf7c9-e112-40b2-9e4d-0cd44783ec9e',
    '46bfe678-66cf-48a9-8bc8-d2eee8274ac3',
    'f271ced4-12e2-4643-8123-1a65df65acf8',
    'aa25684c-90e5-4c5c-aa23-83b65d398b62',
    '9f5c350d-5ee2-4aa4-bd1e-e1ac2ed57e6a',
    '2fbdd92e-1c53-4b9e-b156-f0d2621ed9df',
    'ece1b398-9107-4ed6-ba30-6c3b7d725b0b',
    '630730f6-6a4c-4e91-aab3-ce9bdc92057b',
    'b1234567-89ab-cdef-0123-456789abcdef',
    'c2345678-9abc-def0-1234-56789abcdef0',
    'd3456789-abcd-ef01-2345-6789abcdef01',
    'e4567890-bcde-f012-3456-789abcdef012'
  ];
  v_player_id UUID;
  i INTEGER;
BEGIN
  -- Get the tournament ID
  SELECT id INTO v_tournament_id FROM tournaments WHERE name = 'new3';
  
  -- Create registrations for 16 players
  FOR i IN 1..16 LOOP
    v_player_id := v_player_ids[i];
    
    INSERT INTO tournament_registrations (
      id,
      tournament_id,
      user_id,
      registration_date,
      registration_status,
      payment_status,
      priority_order,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_tournament_id,
      v_player_id,
      NOW() - INTERVAL '1 day',
      'confirmed',
      'completed',
      i,
      NOW(),
      NOW()
    );
  END LOOP;
  
  -- Generate complete double elimination bracket
  PERFORM generate_double_elimination_bracket_complete_v8(v_tournament_id);
  
  RAISE NOTICE '✅ Created test tournament "new3" with ID: %', v_tournament_id;
END $$;

-- Step 2: Fix the advance_double_elimination_v9_fixed function
CREATE OR REPLACE FUNCTION advance_double_elimination_v9_fixed(p_tournament_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_completed_match RECORD;
  v_advancement_count INTEGER := 0;
  v_errors TEXT[] := '{}';
  v_winner_id UUID;
  v_loser_id UUID;
  v_next_round INTEGER;
  v_next_match_number INTEGER;
  v_current_players RECORD;
  v_updated_rows INTEGER;
BEGIN
  RAISE NOTICE '🔄 Starting COMPREHENSIVE advance_double_elimination_v9_fixed for tournament: %', p_tournament_id;

  -- STEP 1: WINNERS BRACKET ADVANCEMENT
  RAISE NOTICE '🏆 Processing Winners Bracket advancements...';
  
  FOR v_completed_match IN
    SELECT tm.*, tm.winner_id, tm.round_number, tm.match_number
    FROM tournament_matches tm
    WHERE tm.tournament_id = p_tournament_id
      AND tm.bracket_type = 'winners'
      AND tm.status = 'completed'
      AND tm.winner_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM tournament_matches tm2
        WHERE tm2.tournament_id = p_tournament_id
          AND tm2.bracket_type = 'winners'
          AND tm2.round_number = tm.round_number + 1
          AND (tm2.player1_id = tm.winner_id OR tm2.player2_id = tm.winner_id)
      )
    ORDER BY tm.round_number, tm.match_number
  LOOP
    v_winner_id := v_completed_match.winner_id;
    v_loser_id := CASE 
      WHEN v_completed_match.player1_id = v_winner_id THEN v_completed_match.player2_id
      ELSE v_completed_match.player1_id
    END;

    RAISE NOTICE '🎯 Processing Winners R% M%: Winner=%, Loser=%', 
      v_completed_match.round_number, v_completed_match.match_number, v_winner_id, v_loser_id;

    -- ADVANCE WINNER TO NEXT WINNERS ROUND (except final round)
    IF v_completed_match.round_number < 4 THEN
      v_next_round := v_completed_match.round_number + 1;
      v_next_match_number := CEIL(v_completed_match.match_number::NUMERIC / 2);
      
      SELECT player1_id, player2_id INTO v_current_players
      FROM tournament_matches
      WHERE tournament_id = p_tournament_id
        AND bracket_type = 'winners'
        AND round_number = v_next_round
        AND match_number = v_next_match_number;

      IF FOUND THEN
        IF v_completed_match.match_number % 2 = 1 THEN
          -- Odd match → player1 position
          IF v_current_players.player1_id IS NULL THEN
            UPDATE tournament_matches 
            SET player1_id = v_winner_id, updated_at = NOW()
            WHERE tournament_id = p_tournament_id
              AND bracket_type = 'winners'
              AND round_number = v_next_round
              AND match_number = v_next_match_number;
            
            GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
            IF v_updated_rows > 0 THEN
              RAISE NOTICE '✅ Advanced winner to Winners R%s M%s player1', v_next_round, v_next_match_number;
              v_advancement_count := v_advancement_count + 1;
            END IF;
          END IF;
        ELSE
          -- Even match → player2 position  
          IF v_current_players.player2_id IS NULL THEN
            UPDATE tournament_matches 
            SET player2_id = v_winner_id, updated_at = NOW()
            WHERE tournament_id = p_tournament_id
              AND bracket_type = 'winners'
              AND round_number = v_next_round
              AND match_number = v_next_match_number;
            
            GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
            IF v_updated_rows > 0 THEN
              RAISE NOTICE '✅ Advanced winner to Winners R%s M%s player2', v_next_round, v_next_match_number;
              v_advancement_count := v_advancement_count + 1;
            END IF;
          END IF;
        END IF;
      END IF;
    END IF;

    -- MOVE LOSERS TO LOSERS BRACKET
    IF v_completed_match.round_number = 1 THEN
      -- R1 losers → Branch A (Round 11)
      v_next_round := 11;
      v_next_match_number := CEIL(v_completed_match.match_number::NUMERIC / 2);
      
    ELSIF v_completed_match.round_number = 2 THEN
      -- R2 losers → Branch B (Round 21)
      v_next_round := 21;
      v_next_match_number := v_completed_match.match_number;
      
    ELSIF v_completed_match.round_number = 3 THEN
      -- R3 losers → Round 22 (merge with Branch B winners)
      v_next_round := 22;
      v_next_match_number := v_completed_match.match_number;
      
    ELSE
      -- Skip loser movement for finals
      CONTINUE;
    END IF;

    -- Place loser in losers bracket
    SELECT player1_id, player2_id INTO v_current_players
    FROM tournament_matches
    WHERE tournament_id = p_tournament_id
      AND bracket_type = 'losers'
      AND round_number = v_next_round
      AND match_number = v_next_match_number;

    IF FOUND THEN
      IF v_current_players.player1_id IS NULL THEN
        UPDATE tournament_matches 
        SET player1_id = v_loser_id, updated_at = NOW()
        WHERE tournament_id = p_tournament_id
          AND bracket_type = 'losers'
          AND round_number = v_next_round
          AND match_number = v_next_match_number;
        
        RAISE NOTICE '✅ Moved loser to Losers R%s M%s player1', v_next_round, v_next_match_number;
      ELSIF v_current_players.player2_id IS NULL THEN
        UPDATE tournament_matches 
        SET player2_id = v_loser_id, updated_at = NOW()
        WHERE tournament_id = p_tournament_id
          AND bracket_type = 'losers'
          AND round_number = v_next_round
          AND match_number = v_next_match_number;
        
        RAISE NOTICE '✅ Moved loser to Losers R%s M%s player2', v_next_round, v_next_match_number;
      END IF;
    END IF;
  END LOOP;

  -- STEP 2: LOSERS BRACKET ADVANCEMENT
  RAISE NOTICE '🔄 Processing Losers Bracket advancements...';
  
  FOR v_completed_match IN
    SELECT tm.*, tm.winner_id, tm.round_number, tm.match_number
    FROM tournament_matches tm
    WHERE tm.tournament_id = p_tournament_id
      AND tm.bracket_type = 'losers'
      AND tm.status = 'completed'
      AND tm.winner_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM tournament_matches tm2
        WHERE tm2.tournament_id = p_tournament_id
          AND tm2.bracket_type IN ('losers', 'semifinals')
          AND tm2.round_number > tm.round_number
          AND (tm2.player1_id = tm.winner_id OR tm2.player2_id = tm.winner_id)
      )
    ORDER BY tm.round_number, tm.match_number
  LOOP
    v_winner_id := v_completed_match.winner_id;
    
    -- Determine next round based on losers bracket structure
    IF v_completed_match.round_number = 11 THEN
      v_next_round := 12; -- Branch A R1 → Branch A R2
    ELSIF v_completed_match.round_number = 12 THEN
      v_next_round := 13; -- Branch A R2 → Branch A R3
    ELSIF v_completed_match.round_number = 21 THEN
      v_next_round := 22; -- Branch B R1 → Branch B R2 (merge with R3 losers)
    ELSIF v_completed_match.round_number = 22 THEN
      -- Branch B R2 winner → Semifinals
      SELECT player1_id, player2_id INTO v_current_players
      FROM tournament_matches
      WHERE tournament_id = p_tournament_id
        AND bracket_type = 'semifinals'
        AND round_number = 31;

      IF FOUND THEN
        IF v_current_players.player2_id IS NULL THEN
          UPDATE tournament_matches 
          SET player2_id = v_winner_id, updated_at = NOW()
          WHERE tournament_id = p_tournament_id
            AND bracket_type = 'semifinals'
            AND round_number = 31;
          
          RAISE NOTICE '✅ Advanced Losers finalist to Semifinals', v_winner_id;
          v_advancement_count := v_advancement_count + 1;
        END IF;
      END IF;
      CONTINUE;
    ELSE
      CONTINUE;
    END IF;
    
    v_next_match_number := CEIL(v_completed_match.match_number::NUMERIC / 2);
    
    -- Advance within losers bracket
    SELECT player1_id, player2_id INTO v_current_players
    FROM tournament_matches
    WHERE tournament_id = p_tournament_id
      AND bracket_type = 'losers'
      AND round_number = v_next_round
      AND match_number = v_next_match_number;

    IF FOUND THEN
      IF v_completed_match.match_number % 2 = 1 AND v_current_players.player1_id IS NULL THEN
        UPDATE tournament_matches 
        SET player1_id = v_winner_id, updated_at = NOW()
        WHERE tournament_id = p_tournament_id
          AND bracket_type = 'losers'
          AND round_number = v_next_round
          AND match_number = v_next_match_number;
        
        RAISE NOTICE '✅ Advanced losers winner to R%s M%s player1', v_next_round, v_next_match_number;
        v_advancement_count := v_advancement_count + 1;
      ELSIF v_completed_match.match_number % 2 = 0 AND v_current_players.player2_id IS NULL THEN
        UPDATE tournament_matches 
        SET player2_id = v_winner_id, updated_at = NOW()
        WHERE tournament_id = p_tournament_id
          AND bracket_type = 'losers'
          AND round_number = v_next_round
          AND match_number = v_next_match_number;
        
        RAISE NOTICE '✅ Advanced losers winner to R%s M%s player2', v_next_round, v_next_match_number;
        v_advancement_count := v_advancement_count + 1;
      END IF;
    END IF;
  END LOOP;

  -- STEP 3: SEMIFINALS ADVANCEMENT
  -- Winners R4 winner → Semifinals player1
  FOR v_completed_match IN
    SELECT tm.*, tm.winner_id
    FROM tournament_matches tm
    WHERE tm.tournament_id = p_tournament_id
      AND tm.bracket_type = 'winners'
      AND tm.round_number = 4
      AND tm.status = 'completed'
      AND tm.winner_id IS NOT NULL
  LOOP
    SELECT player1_id, player2_id INTO v_current_players
    FROM tournament_matches
    WHERE tournament_id = p_tournament_id
      AND bracket_type = 'semifinals'
      AND round_number = 31;

    IF FOUND AND v_current_players.player1_id IS NULL THEN
      UPDATE tournament_matches 
      SET player1_id = v_completed_match.winner_id, updated_at = NOW()
      WHERE tournament_id = p_tournament_id
        AND bracket_type = 'semifinals'
        AND round_number = 31;
      
      RAISE NOTICE '✅ Advanced Winners finalist to Semifinals player1';
      v_advancement_count := v_advancement_count + 1;
    END IF;
  END LOOP;

  -- STEP 4: FINALS ADVANCEMENT  
  FOR v_completed_match IN
    SELECT tm.*, tm.winner_id
    FROM tournament_matches tm
    WHERE tm.tournament_id = p_tournament_id
      AND tm.bracket_type = 'semifinals'
      AND tm.status = 'completed'
      AND tm.winner_id IS NOT NULL
  LOOP
    SELECT player1_id, player2_id INTO v_current_players
    FROM tournament_matches
    WHERE tournament_id = p_tournament_id
      AND bracket_type = 'finals'
      AND round_number = 250;

    IF FOUND THEN
      IF v_current_players.player1_id IS NULL THEN
        UPDATE tournament_matches 
        SET player1_id = v_completed_match.winner_id, updated_at = NOW()
        WHERE tournament_id = p_tournament_id
          AND bracket_type = 'finals'
          AND round_number = 250;
        
        RAISE NOTICE '✅ Advanced Semifinals winner to Finals player1';
        v_advancement_count := v_advancement_count + 1;
      ELSIF v_current_players.player2_id IS NULL THEN
        UPDATE tournament_matches 
        SET player2_id = v_completed_match.winner_id, updated_at = NOW()
        WHERE tournament_id = p_tournament_id
          AND bracket_type = 'finals'
          AND round_number = 250;
        
        RAISE NOTICE '✅ Advanced Semifinals winner to Finals player2';
        v_advancement_count := v_advancement_count + 1;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Completed COMPREHENSIVE advance_double_elimination_v9_fixed: %s advancements', v_advancement_count;

  RETURN jsonb_build_object(
    'success', true,
    'tournament_id', p_tournament_id,
    'advancements_made', v_advancement_count,
    'errors', v_errors,
    'message', format('COMPREHENSIVE FIX - Advanced %s players with complete logic', v_advancement_count)
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Error in COMPREHENSIVE advance_double_elimination_v9_fixed: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'tournament_id', p_tournament_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the auto-advancement trigger (controlled)
CREATE OR REPLACE FUNCTION trigger_auto_advance_double_elimination_fixed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if match was just completed and has a winner
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
     (OLD.status != 'completed' OR OLD.winner_id IS NULL OR OLD.winner_id != NEW.winner_id) THEN
    
    -- Use async notification to prevent recursion
    PERFORM pg_notify('tournament_advancement_needed', 
      json_build_object(
        'tournament_id', NEW.tournament_id,
        'match_id', NEW.id,
        'winner_id', NEW.winner_id
      )::text
    );
    
    RAISE NOTICE '🎯 Auto-advancement triggered for tournament: %', NEW.tournament_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_auto_advance_double_elimination_fixed
  AFTER UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_advance_double_elimination_fixed();

-- Step 4: Add performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournament_matches_tournament_bracket 
  ON tournament_matches(tournament_id, bracket_type, round_number, match_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournament_matches_status_winner 
  ON tournament_matches(tournament_id, status, winner_id) WHERE status = 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournament_registrations_tournament_status 
  ON tournament_registrations(tournament_id, registration_status) WHERE registration_status = 'confirmed';

-- Final verification - log the new tournament details
DO $$
DECLARE
  v_tournament_record RECORD;
  v_match_count INTEGER;
BEGIN
  SELECT * INTO v_tournament_record FROM tournaments WHERE name = 'new3';
  
  SELECT COUNT(*) INTO v_match_count 
  FROM tournament_matches 
  WHERE tournament_id = v_tournament_record.id;
  
  RAISE NOTICE '🎯 SYSTEM FIX COMPLETE:';
  RAISE NOTICE '   Tournament "new3" ID: %', v_tournament_record.id;
  RAISE NOTICE '   Status: %', v_tournament_record.status;
  RAISE NOTICE '   Total Matches: %', v_match_count;
  RAISE NOTICE '   Participants: %', v_tournament_record.current_participants;
  RAISE NOTICE '✅ Double Elimination System Ready for Testing';
END $$;