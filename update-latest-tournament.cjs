// Update SABO32 auto-advancement for latest tournament
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceKey);

async function updateLatestTournament() {
  console.log('=== UPDATING LATEST TOURNAMENT ===');
  
  try {
    // 1. Find latest double elimination tournament
    console.log('1. Finding latest tournament...');
    
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status, max_participants, current_participants, created_at')
      .eq('tournament_type', 'double_elimination')
      .order('created_at', { ascending: false })
      .limit(5);

    if (tournamentsError) {
      console.error('Error fetching tournaments:', tournamentsError);
      return;
    }

    console.log('Latest tournaments:');
    tournaments?.forEach((t, index) => {
      console.log(`${index + 1}. ${t.name} (ID: ${t.id})`);
      console.log(`   Status: ${t.status}, Players: ${t.current_participants}/${t.max_participants}`);
      console.log(`   Created: ${t.created_at}`);
    });

    if (!tournaments || tournaments.length === 0) {
      console.log('No tournaments found');
      return;
    }

    const latestTournament = tournaments[0];
    console.log(`\nUsing latest tournament: ${latestTournament.name} (${latestTournament.id})`);

    // 2. Check if this tournament has SABO32 matches
    const { data: sabo32Matches, error: matchesError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', latestTournament.id)
      .limit(5);

    if (matchesError) {
      console.error('Error checking SABO32 matches:', matchesError);
      return;
    }

    if (!sabo32Matches || sabo32Matches.length === 0) {
      console.log('⚠️  This tournament has no SABO32 matches. Skipping...');
      return;
    }

    console.log(`✅ Found ${sabo32Matches.length} SABO32 matches in this tournament`);

    // 3. Update the trigger function to be tournament-agnostic
    console.log('2. Updating auto-advancement function...');
    
    const updateFunctionSQL = `
CREATE OR REPLACE FUNCTION handle_sabo32_match_completion()
RETURNS TRIGGER AS $$
DECLARE
    advancement_record RECORD;
    cross_match_id UUID;
    target_player_slot TEXT;
BEGIN
    -- Only process completed matches with a winner
    IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
       (OLD.status IS NULL OR OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
        
        RAISE LOG 'SABO32: Processing match completion: % (bracket: %, group: %, winner: %)', 
                  NEW.sabo_match_id, NEW.bracket_type, NEW.group_id, NEW.winner_id;
        
        -- Handle Group Finals advancement to Cross-Bracket
        IF NEW.bracket_type IN ('GROUP_A_FINAL', 'GROUP_B_FINAL') THEN
            RAISE LOG 'SABO32: Group Final completed: % winner: %', NEW.sabo_match_id, NEW.winner_id;
            
            -- Determine which cross semifinal this winner goes to
            IF NEW.bracket_type = 'GROUP_A_FINAL' THEN
                -- Group A winner goes to Cross-SF1
                SELECT id INTO cross_match_id 
                FROM sabo32_matches 
                WHERE tournament_id = NEW.tournament_id 
                  AND bracket_type = 'CROSS_SEMIFINALS'
                  AND sabo_match_id LIKE '%SF1%'
                  AND player1_id IS NULL;
                
                IF cross_match_id IS NOT NULL THEN
                    UPDATE sabo32_matches 
                    SET player1_id = NEW.winner_id, 
                        updated_at = NOW()
                    WHERE id = cross_match_id;
                    
                    RAISE LOG 'SABO32: Advanced Group A winner % to Cross Semifinal 1', NEW.winner_id;
                ELSE
                    RAISE LOG 'SABO32: Could not find available Cross SF1 slot for Group A winner';
                END IF;
                
            ELSIF NEW.bracket_type = 'GROUP_B_FINAL' THEN
                -- Group B winner goes to Cross-SF2
                SELECT id INTO cross_match_id 
                FROM sabo32_matches 
                WHERE tournament_id = NEW.tournament_id 
                  AND bracket_type = 'CROSS_SEMIFINALS'
                  AND sabo_match_id LIKE '%SF2%'
                  AND player1_id IS NULL;
                
                IF cross_match_id IS NOT NULL THEN
                    UPDATE sabo32_matches 
                    SET player1_id = NEW.winner_id, 
                        updated_at = NOW()
                    WHERE id = cross_match_id;
                    
                    RAISE LOG 'SABO32: Advanced Group B winner % to Cross Semifinal 2', NEW.winner_id;
                ELSE
                    RAISE LOG 'SABO32: Could not find available Cross SF2 slot for Group B winner';
                END IF;
            END IF;
        END IF;
        
        -- Handle Cross-Bracket Semifinals advancement to Final
        IF NEW.bracket_type = 'CROSS_SEMIFINALS' THEN
            RAISE LOG 'SABO32: Cross Semifinal completed: % winner: %', NEW.sabo_match_id, NEW.winner_id;
            
            -- Find the cross final match
            SELECT id INTO cross_match_id 
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id 
              AND bracket_type = 'CROSS_FINAL'
              AND (player1_id IS NULL OR player2_id IS NULL);
            
            IF cross_match_id IS NOT NULL THEN
                -- Add winner to first available slot in final
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
                
                RAISE LOG 'SABO32: Advanced Cross Semifinal winner % to Cross Final', NEW.winner_id;
            ELSE
                RAISE LOG 'SABO32: Could not find available Cross Final slot';
            END IF;
        END IF;
        
        -- Handle Cross Final completion (tournament completion)
        IF NEW.bracket_type = 'CROSS_FINAL' THEN
            RAISE LOG 'SABO32: Tournament completed! Champion: %', NEW.winner_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

    const { error: functionError } = await supabase.rpc('exec_sql', { 
      sql: updateFunctionSQL 
    });
    
    if (functionError) {
      console.error('Error updating function:', functionError);
      return;
    }
    
    console.log('✅ Function updated successfully');

    // 4. Ensure trigger exists
    console.log('3. Ensuring trigger exists...');
    
    const ensureTriggerSQL = `
DROP TRIGGER IF EXISTS sabo32_match_completion_trigger ON sabo32_matches;

CREATE TRIGGER sabo32_match_completion_trigger
    AFTER UPDATE ON sabo32_matches
    FOR EACH ROW
    EXECUTE FUNCTION handle_sabo32_match_completion();`;

    const { error: triggerError } = await supabase.rpc('exec_sql', { 
      sql: ensureTriggerSQL 
    });
    
    if (triggerError) {
      console.error('Error ensuring trigger:', triggerError);
      return;
    }
    
    console.log('✅ Trigger ensured');

    // 5. Check current status of latest tournament
    console.log('4. Checking tournament status...');
    
    const { data: groupFinals, error: finalsError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', latestTournament.id)
      .in('bracket_type', ['GROUP_A_FINAL', 'GROUP_B_FINAL'])
      .order('sabo_match_id');

    if (finalsError) {
      console.error('Error checking Group Finals:', finalsError);
      return;
    }

    console.log(`\nGroup Finals status:`);
    groupFinals?.forEach(match => {
      const status = match.winner_id ? `Winner: ${match.winner_id}` : 'Pending';
      console.log(`- ${match.sabo_match_id}: ${status}`);
    });

    // Check Cross-Bracket
    const { data: crossMatches, error: crossError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', latestTournament.id)
      .in('bracket_type', ['CROSS_SEMIFINALS', 'CROSS_FINAL'])
      .order('sabo_match_id');

    if (crossError) {
      console.error('Error checking Cross matches:', crossError);
      return;
    }

    console.log(`\nCross-Bracket status:`);
    crossMatches?.forEach(match => {
      const p1 = match.player1_id ? 'Set' : 'TBD';
      const p2 = match.player2_id ? 'Set' : 'TBD';
      const winner = match.winner_id ? `Winner: ${match.winner_id}` : 'Pending';
      console.log(`- ${match.sabo_match_id}: ${p1} vs ${p2} | ${winner}`);
    });

    console.log('\n🎯 SABO32 auto-advancement is ready for the latest tournament!');
    console.log('Complete any Group Final to test the advancement system.');

  } catch (error) {
    console.error('Overall error:', error);
  }
}

updateLatestTournament();
