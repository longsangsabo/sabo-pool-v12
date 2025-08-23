// Fix Group Final auto-advancement using service key
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceKey);

async function fixGroupFinalAdvancement() {
  const tournamentId = '628efd1f-96e1-4944-a5d0-27e09310d86d';
  
  console.log('=== FIXING GROUP FINAL ADVANCEMENT ===');
  
  try {
    // 1. Create the SABO32 auto-advancement trigger function
    console.log('1. Creating SABO32 auto-advancement function...');
    
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION handle_sabo32_match_completion()
RETURNS TRIGGER AS $$
DECLARE
    advancement_record RECORD;
    cross_match_id UUID;
BEGIN
    -- Only process completed matches with a winner
    IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
       (OLD.status IS NULL OR OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
        
        RAISE LOG 'Processing SABO32 match completion: % (bracket: %, group: %)', 
                  NEW.sabo_match_id, NEW.bracket_type, NEW.group_id;
        
        -- Handle Group Finals advancement to Cross-Bracket
        IF NEW.bracket_type IN ('GROUP_A_FINAL', 'GROUP_B_FINAL') THEN
            RAISE LOG 'Group Final completed: % winner: %', NEW.sabo_match_id, NEW.winner_id;
            
            -- Find the cross-bracket match this winner should advance to
            -- Group A Final winners go to Cross-Bracket Semifinal 1
            -- Group B Final winners go to Cross-Bracket Semifinal 2
            IF NEW.bracket_type = 'GROUP_A_FINAL' THEN
                SELECT id INTO cross_match_id 
                FROM sabo32_matches 
                WHERE tournament_id = NEW.tournament_id 
                  AND bracket_type = 'CROSS_SEMIFINALS'
                  AND sabo_match_id = 'CROSS-SF1'
                  AND player1_id IS NULL;
                
                IF cross_match_id IS NOT NULL THEN
                    UPDATE sabo32_matches 
                    SET player1_id = NEW.winner_id, 
                        updated_at = NOW()
                    WHERE id = cross_match_id;
                    
                    RAISE LOG 'Advanced Group A winner % to Cross Semifinal 1', NEW.winner_id;
                END IF;
                
            ELSIF NEW.bracket_type = 'GROUP_B_FINAL' THEN
                SELECT id INTO cross_match_id 
                FROM sabo32_matches 
                WHERE tournament_id = NEW.tournament_id 
                  AND bracket_type = 'CROSS_SEMIFINALS'
                  AND sabo_match_id = 'CROSS-SF2'
                  AND player1_id IS NULL;
                
                IF cross_match_id IS NOT NULL THEN
                    UPDATE sabo32_matches 
                    SET player1_id = NEW.winner_id, 
                        updated_at = NOW()
                    WHERE id = cross_match_id;
                    
                    RAISE LOG 'Advanced Group B winner % to Cross Semifinal 2', NEW.winner_id;
                END IF;
            END IF;
        END IF;
        
        -- Handle Cross-Bracket Semifinals advancement to Final
        IF NEW.bracket_type = 'CROSS_SEMIFINALS' THEN
            RAISE LOG 'Cross Semifinal completed: % winner: %', NEW.sabo_match_id, NEW.winner_id;
            
            SELECT id INTO cross_match_id 
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id 
              AND bracket_type = 'CROSS_FINAL'
              AND (player1_id IS NULL OR player2_id IS NULL);
            
            IF cross_match_id IS NOT NULL THEN
                -- Add winner to available slot in final
                UPDATE sabo32_matches 
                SET player1_id = CASE 
                                   WHEN player1_id IS NULL THEN NEW.winner_id 
                                   ELSE player1_id 
                                 END,
                    player2_id = CASE 
                                   WHEN player1_id IS NOT NULL AND player2_id IS NULL THEN NEW.winner_id 
                                   ELSE player2_id 
                                 END,
                    updated_at = NOW()
                WHERE id = cross_match_id;
                
                RAISE LOG 'Advanced Cross Semifinal winner % to Cross Final', NEW.winner_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

    const { error: functionError } = await supabase.rpc('exec_sql', { 
      sql: createFunctionSQL 
    });
    
    if (functionError) {
      console.error('Error creating function:', functionError);
      return;
    }
    
    console.log('✅ Function created successfully');

    // 2. Create/replace the trigger
    console.log('2. Creating trigger...');
    
    const createTriggerSQL = `
DROP TRIGGER IF EXISTS sabo32_match_completion_trigger ON sabo32_matches;

CREATE TRIGGER sabo32_match_completion_trigger
    AFTER UPDATE ON sabo32_matches
    FOR EACH ROW
    EXECUTE FUNCTION handle_sabo32_match_completion();`;

    const { error: triggerError } = await supabase.rpc('exec_sql', { 
      sql: createTriggerSQL 
    });
    
    if (triggerError) {
      console.error('Error creating trigger:', triggerError);
      return;
    }
    
    console.log('✅ Trigger created successfully');

    // 3. Test with current Group Finals if any are completed
    console.log('3. Checking current Group Finals status...');
    
    const { data: groupFinals, error: finalsError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .in('bracket_type', ['GROUP_A_FINAL', 'GROUP_B_FINAL'])
      .order('sabo_match_id');

    if (finalsError) {
      console.error('Error checking Group Finals:', finalsError);
      return;
    }

    console.log(`Found ${groupFinals?.length || 0} Group Final matches:`);
    groupFinals?.forEach(match => {
      console.log(`- ${match.sabo_match_id}: ${match.status}, Winner: ${match.winner_id ? 'Yes' : 'No'}`);
    });

    // 4. Check Cross-Bracket matches
    const { data: crossMatches, error: crossError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .in('bracket_type', ['CROSS_SEMIFINALS', 'CROSS_FINAL'])
      .order('sabo_match_id');

    if (crossError) {
      console.error('Error checking Cross matches:', crossError);
      return;
    }

    console.log(`\nCross-Bracket matches:`);
    crossMatches?.forEach(match => {
      console.log(`- ${match.sabo_match_id}: Player1: ${match.player1_id ? 'Set' : 'TBD'}, Player2: ${match.player2_id ? 'Set' : 'TBD'}`);
    });

    console.log('\n✅ SABO32 auto-advancement system is now ready!');
    console.log('Next Group Final completion will automatically advance winner to Cross-Bracket.');

  } catch (error) {
    console.error('Overall error:', error);
  }
}

fixGroupFinalAdvancement();
