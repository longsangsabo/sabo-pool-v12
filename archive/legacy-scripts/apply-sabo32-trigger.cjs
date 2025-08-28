// Apply SABO32 trigger via Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oiqyqjqsghhsypriilxd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pcXlxanFzZ2hoc3lwcmlpbHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4ODgzNTMsImV4cCI6MjA0ODQ2NDM1M30.eJH4jNgPfmSWgCrz1_-FQHxR_7YLR_F-f4JMGzKP3Ns';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSABO32Trigger() {
  try {
    console.log('Creating SABO32 auto-advancement trigger...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- SABO32 Auto-Advancement Trigger Function
        CREATE OR REPLACE FUNCTION handle_sabo32_match_completion()
        RETURNS TRIGGER AS $$
        DECLARE
            loser_id TEXT;
            winner_id TEXT;
            tournament_id TEXT;
            group_id TEXT;
            bracket_type TEXT;
        BEGIN
            -- Only process completed matches with winners
            IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
               (OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
                
                winner_id := NEW.winner_id;
                tournament_id := NEW.tournament_id;
                group_id := NEW.group_id;
                bracket_type := NEW.bracket_type;
                
                -- Determine loser
                loser_id := CASE 
                    WHEN NEW.player1_id = NEW.winner_id THEN NEW.player2_id
                    ELSE NEW.player1_id
                END;
                
                -- GROUP FINALS TO CROSS-BRACKET
                IF bracket_type IN ('GROUP_A_FINAL', 'GROUP_B_FINAL') THEN
                    -- Winner to cross-semifinals
                    IF NEW.group_id = 'A' THEN
                        -- Group A winner to SF1 player1
                        UPDATE sabo32_matches 
                        SET player1_id = winner_id
                        WHERE tournament_id = NEW.tournament_id
                        AND group_id IS NULL
                        AND bracket_type = 'CROSS_SEMIFINALS'
                        AND sabo_match_id = 'SF1'
                        AND player1_id IS NULL;
                        
                        -- Group A runner-up to SF2 player2  
                        UPDATE sabo32_matches 
                        SET player2_id = loser_id
                        WHERE tournament_id = NEW.tournament_id
                        AND group_id IS NULL
                        AND bracket_type = 'CROSS_SEMIFINALS'
                        AND sabo_match_id = 'SF2'
                        AND player2_id IS NULL;
                        
                    ELSIF NEW.group_id = 'B' THEN
                        -- Group B winner to SF2 player1
                        UPDATE sabo32_matches 
                        SET player1_id = winner_id
                        WHERE tournament_id = NEW.tournament_id
                        AND group_id IS NULL
                        AND bracket_type = 'CROSS_SEMIFINALS'
                        AND sabo_match_id = 'SF2'
                        AND player1_id IS NULL;
                        
                        -- Group B runner-up to SF1 player2
                        UPDATE sabo32_matches 
                        SET player2_id = loser_id
                        WHERE tournament_id = NEW.tournament_id
                        AND group_id IS NULL
                        AND bracket_type = 'CROSS_SEMIFINALS'
                        AND sabo_match_id = 'SF1'
                        AND player2_id IS NULL;
                    END IF;
                END IF;
                
                -- CROSS-SEMIFINALS TO FINAL
                IF bracket_type = 'CROSS_SEMIFINALS' THEN
                    -- Advance winner to final
                    UPDATE sabo32_matches 
                    SET player1_id = COALESCE(player1_id, winner_id),
                        player2_id = CASE WHEN player1_id IS NOT NULL THEN winner_id ELSE player2_id END
                    WHERE tournament_id = NEW.tournament_id
                    AND group_id IS NULL
                    AND bracket_type = 'CROSS_FINAL'
                    AND (player1_id IS NULL OR player2_id IS NULL);
                END IF;
                
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create the trigger
        DROP TRIGGER IF EXISTS sabo32_auto_advancement_trigger ON sabo32_matches;

        CREATE TRIGGER sabo32_auto_advancement_trigger
            AFTER UPDATE ON sabo32_matches
            FOR EACH ROW
            WHEN (NEW.status = 'completed' AND NEW.winner_id IS NOT NULL)
            EXECUTE FUNCTION handle_sabo32_match_completion();
      `
    });

    if (error) {
      console.error('Error creating trigger:', error);
    } else {
      console.log('✅ SABO32 auto-advancement trigger created successfully');
    }
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}

createSABO32Trigger();
