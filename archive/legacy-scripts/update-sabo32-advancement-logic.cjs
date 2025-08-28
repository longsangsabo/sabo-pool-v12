const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function updateSABO32AdvancementLogic() {
  console.log('🔄 UPDATING SABO32 AUTO-ADVANCEMENT FOR NEW LOGIC\n');
  console.log('=' .repeat(80));
  console.log('📋 NEW LOGIC: 26 matches per group (14+7+3+2), 55 total matches');
  console.log('🏆 Group Finals: 2 matches per group → 2 winners each');
  console.log('🎯 Cross-Bracket: 4 winners (2 from each group)\n');
  
  try {
    // Updated SABO32 auto-advancement function with new logic
    const newAdvancementFunction = `
    CREATE OR REPLACE FUNCTION public.sabo32_auto_advance_match()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = 'public'
    AS $$
    DECLARE
      v_winner_id UUID;
      v_loser_id UUID;
      v_next_match_id UUID;
      v_next_round INTEGER;
      v_next_match_number INTEGER;
      v_player_slot TEXT;
      v_group_letter TEXT;
      v_winners_champion UUID;
      v_losers_a_champion UUID;
      v_losers_b_champion UUID;
    BEGIN
      -- Only process completed matches with winners
      IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
         (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        v_winner_id := NEW.winner_id;
        v_loser_id := CASE 
          WHEN NEW.player1_id = NEW.winner_id THEN NEW.player2_id 
          ELSE NEW.player1_id 
        END;
        
        RAISE NOTICE 'Processing advancement for match % in bracket %', NEW.sabo_match_id, NEW.bracket_type;
        
        -- ========== WINNERS BRACKET ADVANCEMENT ==========
        IF NEW.bracket_type IN ('GROUP_A_WINNERS', 'GROUP_B_WINNERS') THEN
          
          -- Round 1 → Round 2
          IF NEW.round_number = 1 THEN
            v_next_round := 2;
            v_next_match_number := CEIL(NEW.match_number::numeric / 2);
            v_player_slot := CASE WHEN NEW.match_number % 2 = 1 THEN 'player1_id' ELSE 'player2_id' END;
            
            -- Find next match
            SELECT id INTO v_next_match_id
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id
              AND bracket_type = NEW.bracket_type
              AND round_number = v_next_round
              AND match_number = v_next_match_number;
              
            -- Advance winner
            IF v_next_match_id IS NOT NULL THEN
              IF v_player_slot = 'player1_id' THEN
                UPDATE sabo32_matches 
                SET player1_id = v_winner_id, updated_at = NOW()
                WHERE id = v_next_match_id AND player1_id IS NULL;
              ELSE
                UPDATE sabo32_matches 
                SET player2_id = v_winner_id, updated_at = NOW()
                WHERE id = v_next_match_id AND player2_id IS NULL;
              END IF;
              RAISE NOTICE 'Advanced winner % to Round % Match %', v_winner_id, v_next_round, v_next_match_number;
            END IF;
            
            -- Advance loser to Losers A
            SELECT id INTO v_next_match_id
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id
              AND bracket_type = REPLACE(NEW.bracket_type, '_WINNERS', '_LOSERS_A')
              AND round_number = 101
              AND match_number = CEIL(NEW.match_number::numeric / 2);
              
            IF v_next_match_id IS NOT NULL THEN
              v_player_slot := CASE WHEN NEW.match_number % 2 = 1 THEN 'player1_id' ELSE 'player2_id' END;
              IF v_player_slot = 'player1_id' THEN
                UPDATE sabo32_matches 
                SET player1_id = v_loser_id, updated_at = NOW()
                WHERE id = v_next_match_id AND player1_id IS NULL;
              ELSE
                UPDATE sabo32_matches 
                SET player2_id = v_loser_id, updated_at = NOW()
                WHERE id = v_next_match_id AND player2_id IS NULL;
              END IF;
              RAISE NOTICE 'Advanced loser % to Losers A', v_loser_id;
            END IF;
          
          -- Round 2 → Round 3  
          ELSIF NEW.round_number = 2 THEN
            v_next_round := 3;
            v_next_match_number := CEIL(NEW.match_number::numeric / 2);
            v_player_slot := CASE WHEN NEW.match_number % 2 = 1 THEN 'player1_id' ELSE 'player2_id' END;
            
            SELECT id INTO v_next_match_id
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id
              AND bracket_type = NEW.bracket_type
              AND round_number = v_next_round
              AND match_number = v_next_match_number;
              
            IF v_next_match_id IS NOT NULL THEN
              IF v_player_slot = 'player1_id' THEN
                UPDATE sabo32_matches 
                SET player1_id = v_winner_id, updated_at = NOW()
                WHERE id = v_next_match_id AND player1_id IS NULL;
              ELSE
                UPDATE sabo32_matches 
                SET player2_id = v_winner_id, updated_at = NOW()
                WHERE id = v_next_match_id AND player2_id IS NULL;
              END IF;
            END IF;
            
            -- Advance loser to Losers B
            SELECT id INTO v_next_match_id
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id
              AND bracket_type = REPLACE(NEW.bracket_type, '_WINNERS', '_LOSERS_B')
              AND round_number = 201
              AND match_number = CEIL(NEW.match_number::numeric / 2);
              
            IF v_next_match_id IS NOT NULL THEN
              v_player_slot := CASE WHEN NEW.match_number % 2 = 1 THEN 'player1_id' ELSE 'player2_id' END;
              IF v_player_slot = 'player1_id' THEN
                UPDATE sabo32_matches 
                SET player1_id = v_loser_id, updated_at = NOW()
                WHERE id = v_next_match_id AND player1_id IS NULL;
              ELSE
                UPDATE sabo32_matches 
                SET player2_id = v_loser_id, updated_at = NOW()
                WHERE id = v_next_match_id AND player2_id IS NULL;
              END IF;
            END IF;
          
          -- Round 3 → Check for Group Finals setup
          ELSIF NEW.round_number = 3 THEN
            v_group_letter := CASE WHEN NEW.bracket_type = 'GROUP_A_WINNERS' THEN 'A' ELSE 'B' END;
            
            -- Get the 2 winners from Winners Round 3 (both should be completed)
            DECLARE
              v_winner1 UUID;
              v_winner2 UUID;
              v_completed_count INTEGER;
            BEGIN
              -- Count completed Winners Round 3 matches
              SELECT COUNT(*) INTO v_completed_count
              FROM sabo32_matches
              WHERE tournament_id = NEW.tournament_id
                AND bracket_type = NEW.bracket_type
                AND round_number = 3
                AND status = 'completed';
              
              -- If both Winners Round 3 matches are completed, get winners
              IF v_completed_count = 2 THEN
                SELECT winner_id INTO v_winner1
                FROM sabo32_matches
                WHERE tournament_id = NEW.tournament_id
                  AND bracket_type = NEW.bracket_type
                  AND round_number = 3
                  AND match_number = 1
                  AND status = 'completed';
                
                SELECT winner_id INTO v_winner2
                FROM sabo32_matches
                WHERE tournament_id = NEW.tournament_id
                  AND bracket_type = NEW.bracket_type
                  AND round_number = 3
                  AND match_number = 2
                  AND status = 'completed';
                
                -- Get Losers Branch champions
                SELECT winner_id INTO v_losers_a_champion
                FROM sabo32_matches
                WHERE tournament_id = NEW.tournament_id
                  AND bracket_type = CASE WHEN v_group_letter = 'A' THEN 'GROUP_A_LOSERS_A' ELSE 'GROUP_B_LOSERS_A' END
                  AND round_number = 103
                  AND status = 'completed';
                
                SELECT winner_id INTO v_losers_b_champion
                FROM sabo32_matches
                WHERE tournament_id = NEW.tournament_id
                  AND bracket_type = CASE WHEN v_group_letter = 'A' THEN 'GROUP_A_LOSERS_B' ELSE 'GROUP_B_LOSERS_B' END
                  AND round_number = 202
                  AND status = 'completed';
                
                -- Setup Group Final 1: Winner1 vs Losers A Champion
                IF v_winner1 IS NOT NULL AND v_losers_a_champion IS NOT NULL THEN
                  SELECT id INTO v_next_match_id
                  FROM sabo32_matches
                  WHERE tournament_id = NEW.tournament_id
                    AND bracket_type = CASE WHEN v_group_letter = 'A' THEN 'GROUP_A_FINAL' ELSE 'GROUP_B_FINAL' END
                    AND round_number = 250
                    AND match_number = 1;
                  
                  IF v_next_match_id IS NOT NULL THEN
                    UPDATE sabo32_matches
                    SET player1_id = v_winner1,
                        player2_id = v_losers_a_champion,
                        status = 'ready',
                        updated_at = NOW()
                    WHERE id = v_next_match_id
                      AND player1_id IS NULL 
                      AND player2_id IS NULL;
                      
                    RAISE NOTICE 'Set up Group % Final 1: % vs %', v_group_letter, v_winner1, v_losers_a_champion;
                  END IF;
                END IF;
                
                -- Setup Group Final 2: Winner2 vs Losers B Champion
                IF v_winner2 IS NOT NULL AND v_losers_b_champion IS NOT NULL THEN
                  SELECT id INTO v_next_match_id
                  FROM sabo32_matches
                  WHERE tournament_id = NEW.tournament_id
                    AND bracket_type = CASE WHEN v_group_letter = 'A' THEN 'GROUP_A_FINAL' ELSE 'GROUP_B_FINAL' END
                    AND round_number = 251
                    AND match_number = 2;
                  
                  IF v_next_match_id IS NOT NULL THEN
                    UPDATE sabo32_matches
                    SET player1_id = v_winner2,
                        player2_id = v_losers_b_champion,
                        status = 'ready',
                        updated_at = NOW()
                    WHERE id = v_next_match_id
                      AND player1_id IS NULL 
                      AND player2_id IS NULL;
                      
                    RAISE NOTICE 'Set up Group % Final 2: % vs %', v_group_letter, v_winner2, v_losers_b_champion;
                  END IF;
                END IF;
              END IF;
            END;
          END IF;
        
        -- ========== LOSERS BRACKET ADVANCEMENT ==========
        ELSIF NEW.bracket_type IN ('GROUP_A_LOSERS_A', 'GROUP_B_LOSERS_A') THEN
          -- Losers A progression
          v_next_round := NEW.round_number + 1;
          v_next_match_number := CEIL(NEW.match_number::numeric / 2);
          
          SELECT id INTO v_next_match_id
          FROM sabo32_matches 
          WHERE tournament_id = NEW.tournament_id
            AND bracket_type = NEW.bracket_type
            AND round_number = v_next_round
            AND match_number = v_next_match_number;
            
          IF v_next_match_id IS NOT NULL THEN
            v_player_slot := CASE WHEN NEW.match_number % 2 = 1 THEN 'player1_id' ELSE 'player2_id' END;
            IF v_player_slot = 'player1_id' THEN
              UPDATE sabo32_matches 
              SET player1_id = v_winner_id, updated_at = NOW()
              WHERE id = v_next_match_id AND player1_id IS NULL;
            ELSE
              UPDATE sabo32_matches 
              SET player2_id = v_winner_id, updated_at = NOW()
              WHERE id = v_next_match_id AND player2_id IS NULL;
            END IF;
          END IF;
          
        ELSIF NEW.bracket_type IN ('GROUP_A_LOSERS_B', 'GROUP_B_LOSERS_B') THEN
          -- Losers B progression
          v_next_round := NEW.round_number + 1;
          v_next_match_number := CEIL(NEW.match_number::numeric / 2);
          
          SELECT id INTO v_next_match_id
          FROM sabo32_matches 
          WHERE tournament_id = NEW.tournament_id
            AND bracket_type = NEW.bracket_type
            AND round_number = v_next_round
            AND match_number = v_next_match_number;
            
          IF v_next_match_id IS NOT NULL THEN
            v_player_slot := CASE WHEN NEW.match_number % 2 = 1 THEN 'player1_id' ELSE 'player2_id' END;
            IF v_player_slot = 'player1_id' THEN
              UPDATE sabo32_matches 
              SET player1_id = v_winner_id, updated_at = NOW()
              WHERE id = v_next_match_id AND player1_id IS NULL;
            ELSE
              UPDATE sabo32_matches 
              SET player2_id = v_winner_id, updated_at = NOW()
              WHERE id = v_next_match_id AND player2_id IS NULL;
            END IF;
          END IF;
        
        -- ========== GROUP FINALS ADVANCEMENT ==========
        ELSIF NEW.bracket_type IN ('GROUP_A_FINAL', 'GROUP_B_FINAL') THEN
          v_group_letter := CASE WHEN NEW.bracket_type = 'GROUP_A_FINAL' THEN 'A' ELSE 'B' END;
          
          -- Check if both Group Finals are completed
          DECLARE
            v_group_final_count INTEGER;
            v_winner1_final UUID;
            v_winner2_final UUID;
            v_other_group_winners_count INTEGER;
          BEGIN
            -- Count completed group finals for this group
            SELECT COUNT(*) INTO v_group_final_count
            FROM sabo32_matches
            WHERE tournament_id = NEW.tournament_id
              AND bracket_type = NEW.bracket_type
              AND status = 'completed';
            
            -- If both finals completed, check Cross-Bracket setup
            IF v_group_final_count = 2 THEN
              -- Get both winners from this group
              SELECT winner_id INTO v_winner1_final
              FROM sabo32_matches
              WHERE tournament_id = NEW.tournament_id
                AND bracket_type = NEW.bracket_type
                AND round_number = 250
                AND status = 'completed';
              
              SELECT winner_id INTO v_winner2_final
              FROM sabo32_matches
              WHERE tournament_id = NEW.tournament_id
                AND bracket_type = NEW.bracket_type
                AND round_number = 251
                AND status = 'completed';
              
              RAISE NOTICE 'Group % completed: Winner1=%, Winner2=%', v_group_letter, v_winner1_final, v_winner2_final;
              
              -- Check if other group also has 2 winners
              SELECT COUNT(*) INTO v_other_group_winners_count
              FROM sabo32_matches
              WHERE tournament_id = NEW.tournament_id
                AND bracket_type = CASE WHEN v_group_letter = 'A' THEN 'GROUP_B_FINAL' ELSE 'GROUP_A_FINAL' END
                AND status = 'completed';
              
              -- If both groups have 2 winners each, setup Cross-Bracket
              IF v_other_group_winners_count = 2 THEN
                RAISE NOTICE 'Both groups completed! Setting up Cross-Bracket...';
                
                -- Setup Cross-Bracket Semifinals
                DECLARE
                  v_other_winner1 UUID;
                  v_other_winner2 UUID;
                  v_sf1_match_id UUID;
                  v_sf2_match_id UUID;
                BEGIN
                  -- Get other group winners
                  SELECT winner_id INTO v_other_winner1
                  FROM sabo32_matches
                  WHERE tournament_id = NEW.tournament_id
                    AND bracket_type = CASE WHEN v_group_letter = 'A' THEN 'GROUP_B_FINAL' ELSE 'GROUP_A_FINAL' END
                    AND round_number = 250
                    AND status = 'completed';
                  
                  SELECT winner_id INTO v_other_winner2
                  FROM sabo32_matches
                  WHERE tournament_id = NEW.tournament_id
                    AND bracket_type = CASE WHEN v_group_letter = 'A' THEN 'GROUP_B_FINAL' ELSE 'GROUP_A_FINAL' END
                    AND round_number = 251
                    AND status = 'completed';
                  
                  -- SF1: Winner1 Group A vs Winner1 Group B
                  SELECT id INTO v_sf1_match_id
                  FROM sabo32_matches
                  WHERE tournament_id = NEW.tournament_id
                    AND bracket_type = 'CROSS_SEMIFINALS'
                    AND round_number = 350
                    AND match_number = 1;
                  
                  -- SF2: Winner2 Group A vs Winner2 Group B
                  SELECT id INTO v_sf2_match_id
                  FROM sabo32_matches
                  WHERE tournament_id = NEW.tournament_id
                    AND bracket_type = 'CROSS_SEMIFINALS'
                    AND round_number = 350
                    AND match_number = 2;
                  
                  -- Set up SF1
                  IF v_sf1_match_id IS NOT NULL THEN
                    IF v_group_letter = 'A' THEN
                      UPDATE sabo32_matches
                      SET player1_id = v_winner1_final,
                          player2_id = v_other_winner1,
                          status = 'ready',
                          updated_at = NOW()
                      WHERE id = v_sf1_match_id;
                    ELSE
                      UPDATE sabo32_matches
                      SET player1_id = v_other_winner1,
                          player2_id = v_winner1_final,
                          status = 'ready',
                          updated_at = NOW()
                      WHERE id = v_sf1_match_id;
                    END IF;
                    RAISE NOTICE 'Set up Cross SF1';
                  END IF;
                  
                  -- Set up SF2
                  IF v_sf2_match_id IS NOT NULL THEN
                    IF v_group_letter = 'A' THEN
                      UPDATE sabo32_matches
                      SET player1_id = v_winner2_final,
                          player2_id = v_other_winner2,
                          status = 'ready',
                          updated_at = NOW()
                      WHERE id = v_sf2_match_id;
                    ELSE
                      UPDATE sabo32_matches
                      SET player1_id = v_other_winner2,
                          player2_id = v_winner2_final,
                          status = 'ready',
                          updated_at = NOW()
                      WHERE id = v_sf2_match_id;
                    END IF;
                    RAISE NOTICE 'Set up Cross SF2';
                  END IF;
                END;
              END IF;
            END IF;
          END;
        
        -- ========== CROSS-BRACKET ADVANCEMENT ==========
        ELSIF NEW.bracket_type = 'CROSS_SEMIFINALS' THEN
          -- Advance to Cross Final
          SELECT id INTO v_next_match_id
          FROM sabo32_matches
          WHERE tournament_id = NEW.tournament_id
            AND bracket_type = 'CROSS_FINAL'
            AND round_number = 400;
          
          IF v_next_match_id IS NOT NULL THEN
            v_player_slot := CASE WHEN NEW.match_number = 1 THEN 'player1_id' ELSE 'player2_id' END;
            IF v_player_slot = 'player1_id' THEN
              UPDATE sabo32_matches
              SET player1_id = v_winner_id, updated_at = NOW()
              WHERE id = v_next_match_id AND player1_id IS NULL;
            ELSE
              UPDATE sabo32_matches
              SET player2_id = v_winner_id, updated_at = NOW()
              WHERE id = v_next_match_id AND player2_id IS NULL;
            END IF;
            RAISE NOTICE 'Advanced % to Cross Final', v_winner_id;
          END IF;
        
        ELSIF NEW.bracket_type = 'CROSS_FINAL' THEN
          RAISE NOTICE '🏆 TOURNAMENT CHAMPION: %', v_winner_id;
        END IF;
      END IF;
      
      RETURN NEW;
    END;
    $$;
    `;
    
    console.log('1️⃣ Creating updated auto-advancement function...');
    const { error: functionError } = await serviceSupabase.rpc('exec_sql', {
      sql: newAdvancementFunction
    });
    
    if (functionError) {
      console.error('❌ Function creation failed:', functionError);
      throw functionError;
    }
    
    console.log('✅ Updated function created successfully');
    
    // Drop and recreate trigger with updated bracket types
    const triggerSQL = `
    DROP TRIGGER IF EXISTS sabo32_auto_advance_trigger ON sabo32_matches;
    CREATE TRIGGER sabo32_auto_advance_trigger
      AFTER UPDATE ON sabo32_matches
      FOR EACH ROW
      EXECUTE FUNCTION sabo32_auto_advance_match();
    `;
    
    console.log('2️⃣ Recreating trigger...');
    const { error: triggerError } = await serviceSupabase.rpc('exec_sql', {
      sql: triggerSQL
    });
    
    if (triggerError) {
      console.error('❌ Trigger creation failed:', triggerError);
      throw triggerError;
    }
    
    console.log('✅ Trigger recreated successfully');
    
    console.log('\n🎯 AUTO-ADVANCEMENT SYSTEM UPDATED');
    console.log('=' .repeat(50));
    console.log('✅ Function: sabo32_auto_advance_match()');
    console.log('✅ Trigger: sabo32_auto_advance_trigger');
    console.log('📋 New Logic:');
    console.log('   - 26 matches per group (14+7+3+2)');
    console.log('   - 2 Group Finals per group → 2 winners each');
    console.log('   - Cross-Bracket: 4 winners (2 from each group)');
    console.log('   - Total: 55 matches (26+26+3)');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateSABO32AdvancementLogic().catch(console.error);
}

module.exports = { updateSABO32AdvancementLogic };
