require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function implementAdvancementSystem() {
  console.log('🚀 IMPLEMENTING AUTOMATIC ADVANCEMENT SYSTEM');
  console.log('='.repeat(50));
  
  try {
    // 1. Create the main advancement function
    console.log('\n1. 🤖 Creating automatic advancement function...');
    
    const advancementFunction = `
      CREATE OR REPLACE FUNCTION handle_sabo32_advancement()
      RETURNS TRIGGER AS $$
      DECLARE
        winner_player_id UUID;
        loser_player_id UUID;
        next_match_id UUID;
        loser_match_id UUID;
        group_char TEXT;
        advance_count INTEGER;
      BEGIN
        -- Only process when match status changes to completed
        IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
          
          winner_player_id := NEW.winner_id;
          loser_player_id := CASE 
            WHEN NEW.player1_id = NEW.winner_id THEN NEW.player2_id
            ELSE NEW.player1_id
          END;
          group_char := NEW.group_id;
          
          RAISE NOTICE 'Processing advancement for match: %, Winner: %, Group: %', 
                       NEW.sabo_match_id, winner_player_id, group_char;
          
          -- Handle Winners Bracket Advancement
          IF NEW.bracket_type LIKE '%WINNERS%' THEN
            
            -- Round 1 Winners -> Round 2 Winners
            IF NEW.round_number = 1 THEN
              UPDATE sabo32_matches 
              SET player1_id = CASE 
                WHEN player1_id IS NULL THEN winner_player_id
                ELSE player2_id 
              END,
              player2_id = CASE 
                WHEN player1_id IS NULL THEN player2_id
                ELSE winner_player_id 
              END,
              updated_at = NOW()
              WHERE group_id = group_char 
                AND bracket_type = 'GROUP_' || group_char || '_WINNERS'
                AND round_number = 2
                AND (player1_id IS NULL OR player2_id IS NULL)
              LIMIT 1;
              
            -- Round 2 Winners -> Round 3 Winners  
            ELSIF NEW.round_number = 2 THEN
              UPDATE sabo32_matches 
              SET player1_id = CASE 
                WHEN player1_id IS NULL THEN winner_player_id
                ELSE player2_id 
              END,
              player2_id = CASE 
                WHEN player1_id IS NULL THEN player2_id
                ELSE winner_player_id 
              END,
              updated_at = NOW()
              WHERE group_id = group_char 
                AND bracket_type = 'GROUP_' || group_char || '_WINNERS'
                AND round_number = 3
                AND (player1_id IS NULL OR player2_id IS NULL)
              LIMIT 1;
              
            -- Round 3 Winners -> Group Final
            ELSIF NEW.round_number = 3 THEN
              UPDATE sabo32_matches 
              SET player1_id = CASE 
                WHEN player1_id IS NULL THEN winner_player_id
                ELSE player2_id 
              END,
              player2_id = CASE 
                WHEN player1_id IS NULL THEN player2_id
                ELSE winner_player_id 
              END,
              updated_at = NOW()
              WHERE group_id = group_char 
                AND bracket_type = 'GROUP_' || group_char || '_FINAL'
                AND round_number = 250
                AND (player1_id IS NULL OR player2_id IS NULL)
              LIMIT 1;
            END IF;
            
            -- Losers bracket feeder logic
            IF NEW.round_number IN (1, 2) THEN
              -- Feed loser to appropriate losers bracket
              UPDATE sabo32_matches 
              SET player1_id = CASE 
                WHEN player1_id IS NULL THEN loser_player_id
                ELSE player2_id 
              END,
              player2_id = CASE 
                WHEN player1_id IS NULL THEN player2_id
                ELSE loser_player_id 
              END,
              updated_at = NOW()
              WHERE group_id = group_char 
                AND bracket_type LIKE 'GROUP_' || group_char || '_LOSERS_%'
                AND (player1_id IS NULL OR player2_id IS NULL)
              ORDER BY round_number, match_number
              LIMIT 1;
            END IF;
            
          -- Handle Losers Bracket Advancement  
          ELSIF NEW.bracket_type LIKE '%LOSERS%' THEN
            
            -- Losers A advancement
            IF NEW.bracket_type LIKE '%LOSERS_A%' THEN
              -- Check if this is the final Losers A match
              IF NEW.round_number >= 100 THEN
                UPDATE sabo32_matches 
                SET player1_id = CASE 
                  WHEN player1_id IS NULL THEN winner_player_id
                  ELSE player2_id 
                END,
                player2_id = CASE 
                  WHEN player1_id IS NULL THEN player2_id
                  ELSE winner_player_id 
                END,
                updated_at = NOW()
                WHERE group_id = group_char 
                  AND bracket_type = 'GROUP_' || group_char || '_FINAL'
                  AND round_number = 251
                  AND (player1_id IS NULL OR player2_id IS NULL)
                LIMIT 1;
              END IF;
              
            -- Losers B advancement  
            ELSIF NEW.bracket_type LIKE '%LOSERS_B%' THEN
              -- Check if this is the final Losers B match
              IF NEW.round_number >= 200 THEN
                UPDATE sabo32_matches 
                SET player1_id = CASE 
                  WHEN player1_id IS NULL THEN winner_player_id
                  ELSE player2_id 
                END,
                player2_id = CASE 
                  WHEN player1_id IS NULL THEN player2_id
                  ELSE winner_player_id 
                END,
                updated_at = NOW()
                WHERE group_id = group_char 
                  AND bracket_type = 'GROUP_' || group_char || '_FINAL'
                  AND round_number = 251
                  AND (player1_id IS NULL OR player2_id IS NULL)
                LIMIT 1;
              END IF;
            END IF;
          END IF;
          
          RAISE NOTICE 'Advancement processing completed for match: %', NEW.sabo_match_id;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: advancementFunction
    });
    
    if (functionError) {
      console.error('❌ Error creating function:', functionError);
      return;
    }
    
    console.log('✅ Advancement function created successfully');
    
    // 2. Create the trigger
    console.log('\n2. 🔗 Creating advancement trigger...');
    
    const triggerSQL = `
      -- Drop existing trigger if exists
      DROP TRIGGER IF EXISTS sabo32_auto_advancement_trigger ON sabo32_matches;
      
      -- Create new trigger
      CREATE TRIGGER sabo32_auto_advancement_trigger
        AFTER UPDATE ON sabo32_matches
        FOR EACH ROW
        EXECUTE FUNCTION handle_sabo32_advancement();
    `;
    
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: triggerSQL
    });
    
    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      return;
    }
    
    console.log('✅ Advancement trigger created successfully');
    
    // 3. Create validation function
    console.log('\n3. 🛡️ Creating validation function...');
    
    const validationFunction = `
      CREATE OR REPLACE FUNCTION validate_tournament_advancement(tournament_id_param UUID DEFAULT NULL)
      RETURNS TABLE(
        group_id TEXT,
        bracket_type TEXT,
        missing_players INTEGER,
        total_matches INTEGER,
        completion_rate NUMERIC
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          m.group_id,
          m.bracket_type,
          COUNT(CASE WHEN m.player1_id IS NULL OR m.player2_id IS NULL THEN 1 END)::INTEGER as missing_players,
          COUNT(*)::INTEGER as total_matches,
          ROUND(
            (COUNT(CASE WHEN m.player1_id IS NOT NULL AND m.player2_id IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
          ) as completion_rate
        FROM sabo32_matches m
        WHERE (tournament_id_param IS NULL OR m.tournament_id = tournament_id_param)
          AND m.status = 'pending'
        GROUP BY m.group_id, m.bracket_type
        ORDER BY m.group_id, m.bracket_type;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error: validationError } = await supabase.rpc('exec_sql', {
      sql: validationFunction
    });
    
    if (validationError) {
      console.error('❌ Error creating validation function:', validationError);
    } else {
      console.log('✅ Validation function created successfully');
    }
    
    // 4. Create health check function
    console.log('\n4. 📊 Creating health check function...');
    
    const healthCheckFunction = `
      CREATE OR REPLACE FUNCTION check_tournament_health()
      RETURNS TABLE(
        tournament_id UUID,
        total_matches INTEGER,
        completed_matches INTEGER,
        pending_matches INTEGER,
        matches_with_players INTEGER,
        matches_without_players INTEGER,
        health_score NUMERIC
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          m.tournament_id,
          COUNT(*)::INTEGER as total_matches,
          COUNT(CASE WHEN m.status = 'completed' THEN 1 END)::INTEGER as completed_matches,
          COUNT(CASE WHEN m.status = 'pending' THEN 1 END)::INTEGER as pending_matches,
          COUNT(CASE WHEN m.player1_id IS NOT NULL AND m.player2_id IS NOT NULL THEN 1 END)::INTEGER as matches_with_players,
          COUNT(CASE WHEN m.player1_id IS NULL OR m.player2_id IS NULL THEN 1 END)::INTEGER as matches_without_players,
          ROUND(
            (COUNT(CASE WHEN m.player1_id IS NOT NULL AND m.player2_id IS NOT NULL THEN 1 END)::NUMERIC / 
             COUNT(CASE WHEN m.status = 'pending' THEN 1 END)::NUMERIC) * 100, 
            2
          ) as health_score
        FROM sabo32_matches m
        GROUP BY m.tournament_id
        ORDER BY m.tournament_id;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error: healthError } = await supabase.rpc('exec_sql', {
      sql: healthCheckFunction
    });
    
    if (healthError) {
      console.error('❌ Error creating health check function:', healthError);
    } else {
      console.log('✅ Health check function created successfully');
    }
    
    console.log('\n🎉 ADVANCEMENT SYSTEM IMPLEMENTATION COMPLETE!');
    console.log('='.repeat(50));
    console.log('✅ Automatic advancement function: handle_sabo32_advancement()');
    console.log('✅ Advancement trigger: sabo32_auto_advancement_trigger');
    console.log('✅ Validation function: validate_tournament_advancement()');
    console.log('✅ Health check function: check_tournament_health()');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Test the system with a sample match completion');
    console.log('2. Validate current tournament health');
    console.log('3. Monitor future tournaments for automatic advancement');
    
  } catch (error) {
    console.error('❌ Implementation error:', error);
  }
}

implementAdvancementSystem().catch(console.error);
