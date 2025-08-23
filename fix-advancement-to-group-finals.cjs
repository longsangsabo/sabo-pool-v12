// Fix advancement INTO Group Finals
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceKey);

async function fixAdvancementToGroupFinals() {
  const tournamentId = '628efd1f-96e1-4944-a5d0-27e09310d86d';
  
  console.log('=== FIXING ADVANCEMENT TO GROUP FINALS ===');
  
  try {
    // 1. Get all matches for analysis
    const { data: allMatches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('bracket_type')
      .order('sabo_match_id');

    if (error) throw error;

    // Group by bracket type
    const brackets = {};
    allMatches?.forEach(match => {
      if (!brackets[match.bracket_type]) {
        brackets[match.bracket_type] = [];
      }
      brackets[match.bracket_type].push(match);
    });

    console.log('2. Identifying Group Finals advancement logic...');

    // SABO32 Logic:
    // A-FINAL1: Winners bracket final winner vs Losers bracket final winner 
    // A-FINAL2: Winner of A-FINAL1 vs Runner-up (determined by additional losers logic)
    // Similar for Group B

    // For Group A:
    const groupAWinners = brackets['GROUP_A_WINNERS'] || [];
    const groupALosersA = brackets['GROUP_A_LOSERS_A'] || [];
    const groupALosersB = brackets['GROUP_A_LOSERS_B'] || [];
    const groupAFinals = brackets['GROUP_A_FINAL'] || [];

    // Find the ultimate winners of each bracket
    // Winners bracket champion (highest round winner)
    const winnersChampion = groupAWinners
      .filter(m => m.status === 'completed' && m.winner_id)
      .sort((a, b) => b.round_number - a.round_number)[0];

    // Losers bracket champion (final match in losers)
    const losersAChampion = groupALosersA
      .filter(m => m.status === 'completed' && m.winner_id)
      .sort((a, b) => b.round_number - a.round_number)[0];

    const losersBChampion = groupALosersB
      .filter(m => m.status === 'completed' && m.winner_id)
      .sort((a, b) => b.round_number - a.round_number)[0];

    console.log('\nGroup A Analysis:');
    console.log('Winners Champion:', winnersChampion?.sabo_match_id, '->', winnersChampion?.winner_id);
    console.log('Losers A Champion:', losersAChampion?.sabo_match_id, '->', losersAChampion?.winner_id);
    console.log('Losers B Champion:', losersBChampion?.sabo_match_id, '->', losersBChampion?.winner_id);

    const fixes = [];

    // Set up A-FINAL1: Winners champion vs Losers A champion
    if (winnersChampion && losersAChampion) {
      const aFinal1 = groupAFinals.find(m => m.sabo_match_id === 'A-FINAL1');
      if (aFinal1 && (!aFinal1.player1_id || !aFinal1.player2_id)) {
        const { error } = await supabase
          .from('sabo32_matches')
          .update({
            player1_id: winnersChampion.winner_id,  // Winners champion
            player2_id: losersAChampion.winner_id,  // Losers A champion
            updated_at: new Date().toISOString()
          })
          .eq('id', aFinal1.id);

        if (!error) {
          fixes.push(`✅ A-FINAL1: ${winnersChampion.winner_id} vs ${losersAChampion.winner_id}`);
        } else {
          fixes.push(`❌ Failed to set A-FINAL1: ${error.message}`);
        }
      }
    }

    // Set up A-FINAL2: (Will be determined after A-FINAL1 completion vs Losers B champion)
    if (losersBChampion) {
      const aFinal2 = groupAFinals.find(m => m.sabo_match_id === 'A-FINAL2');
      if (aFinal2 && !aFinal2.player2_id) {
        const { error } = await supabase
          .from('sabo32_matches')
          .update({
            player2_id: losersBChampion.winner_id,  // Losers B champion is always player2
            updated_at: new Date().toISOString()
          })
          .eq('id', aFinal2.id);

        if (!error) {
          fixes.push(`✅ A-FINAL2: TBD vs ${losersBChampion.winner_id} (player1 will be A-FINAL1 winner)`);
        } else {
          fixes.push(`❌ Failed to set A-FINAL2 player2: ${error.message}`);
        }
      }
    }

    // Repeat for Group B
    const groupBWinners = brackets['GROUP_B_WINNERS'] || [];
    const groupBLosersA = brackets['GROUP_B_LOSERS_A'] || [];
    const groupBLosersB = brackets['GROUP_B_LOSERS_B'] || [];
    const groupBFinals = brackets['GROUP_B_FINAL'] || [];

    const bWinnersChampion = groupBWinners
      .filter(m => m.status === 'completed' && m.winner_id)
      .sort((a, b) => b.round_number - a.round_number)[0];

    const bLosersAChampion = groupBLosersA
      .filter(m => m.status === 'completed' && m.winner_id)
      .sort((a, b) => b.round_number - a.round_number)[0];

    const bLosersBChampion = groupBLosersB
      .filter(m => m.status === 'completed' && m.winner_id)
      .sort((a, b) => b.round_number - a.round_number)[0];

    console.log('\nGroup B Analysis:');
    console.log('Winners Champion:', bWinnersChampion?.sabo_match_id, '->', bWinnersChampion?.winner_id);
    console.log('Losers A Champion:', bLosersAChampion?.sabo_match_id, '->', bLosersAChampion?.winner_id);
    console.log('Losers B Champion:', bLosersBChampion?.sabo_match_id, '->', bLosersBChampion?.winner_id);

    // Set up B-FINAL1
    if (bWinnersChampion && bLosersAChampion) {
      const bFinal1 = groupBFinals.find(m => m.sabo_match_id === 'B-FINAL1');
      if (bFinal1 && (!bFinal1.player1_id || !bFinal1.player2_id)) {
        const { error } = await supabase
          .from('sabo32_matches')
          .update({
            player1_id: bWinnersChampion.winner_id,
            player2_id: bLosersAChampion.winner_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', bFinal1.id);

        if (!error) {
          fixes.push(`✅ B-FINAL1: ${bWinnersChampion.winner_id} vs ${bLosersAChampion.winner_id}`);
        } else {
          fixes.push(`❌ Failed to set B-FINAL1: ${error.message}`);
        }
      }
    }

    // Set up B-FINAL2
    if (bLosersBChampion) {
      const bFinal2 = groupBFinals.find(m => m.sabo_match_id === 'B-FINAL2');
      if (bFinal2 && !bFinal2.player2_id) {
        const { error } = await supabase
          .from('sabo32_matches')
          .update({
            player2_id: bLosersBChampion.winner_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', bFinal2.id);

        if (!error) {
          fixes.push(`✅ B-FINAL2: TBD vs ${bLosersBChampion.winner_id} (player1 will be B-FINAL1 winner)`);
        } else {
          fixes.push(`❌ Failed to set B-FINAL2 player2: ${error.message}`);
        }
      }
    }

    console.log('\n=== FIXES APPLIED ===');
    fixes.forEach(fix => console.log(fix));

    if (fixes.filter(f => f.startsWith('✅')).length > 0) {
      console.log('\n🎯 Group Finals are now ready for play!');
    } else {
      console.log('\n⚠️  No fixes were needed or all fixes failed.');
    }

    // 3. Create enhanced trigger for Group Finals to A-FINAL2 advancement
    console.log('\n4. Creating enhanced advancement trigger...');
    
    const enhancedTriggerSQL = `
CREATE OR REPLACE FUNCTION handle_sabo32_match_completion()
RETURNS TRIGGER AS $$
DECLARE
    cross_match_id UUID;
    final2_match_id UUID;
BEGIN
    -- Only process completed matches with a winner
    IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND 
       (OLD.status IS NULL OR OLD.status != 'completed' OR OLD.winner_id IS NULL) THEN
        
        RAISE LOG 'SABO32: Processing match completion: % (bracket: %, winner: %)', 
                  NEW.sabo_match_id, NEW.bracket_type, NEW.winner_id;
        
        -- Handle A-FINAL1 completion -> advance winner to A-FINAL2
        IF NEW.sabo_match_id = 'A-FINAL1' THEN
            SELECT id INTO final2_match_id 
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id 
              AND sabo_match_id = 'A-FINAL2'
              AND player1_id IS NULL;
            
            IF final2_match_id IS NOT NULL THEN
                UPDATE sabo32_matches 
                SET player1_id = NEW.winner_id, 
                    updated_at = NOW()
                WHERE id = final2_match_id;
                
                RAISE LOG 'SABO32: Advanced A-FINAL1 winner % to A-FINAL2', NEW.winner_id;
            END IF;
        END IF;
        
        -- Handle B-FINAL1 completion -> advance winner to B-FINAL2
        IF NEW.sabo_match_id = 'B-FINAL1' THEN
            SELECT id INTO final2_match_id 
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id 
              AND sabo_match_id = 'B-FINAL2'
              AND player1_id IS NULL;
            
            IF final2_match_id IS NOT NULL THEN
                UPDATE sabo32_matches 
                SET player1_id = NEW.winner_id, 
                    updated_at = NOW()
                WHERE id = final2_match_id;
                
                RAISE LOG 'SABO32: Advanced B-FINAL1 winner % to B-FINAL2', NEW.winner_id;
            END IF;
        END IF;
        
        -- Handle Group Finals (A-FINAL2, B-FINAL2) -> Cross-Bracket
        IF NEW.bracket_type IN ('GROUP_A_FINAL', 'GROUP_B_FINAL') THEN
            IF NEW.bracket_type = 'GROUP_A_FINAL' THEN
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
                    
                    RAISE LOG 'SABO32: Advanced Group A Final winner % to Cross SF1', NEW.winner_id;
                END IF;
                
            ELSIF NEW.bracket_type = 'GROUP_B_FINAL' THEN
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
                    
                    RAISE LOG 'SABO32: Advanced Group B Final winner % to Cross SF2', NEW.winner_id;
                END IF;
            END IF;
        END IF;
        
        -- Handle Cross-Bracket advancement
        IF NEW.bracket_type = 'CROSS_SEMIFINALS' THEN
            SELECT id INTO cross_match_id 
            FROM sabo32_matches 
            WHERE tournament_id = NEW.tournament_id 
              AND bracket_type = 'CROSS_FINAL'
              AND (player1_id IS NULL OR player2_id IS NULL);
            
            IF cross_match_id IS NOT NULL THEN
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
                
                RAISE LOG 'SABO32: Advanced Cross SF winner % to Cross Final', NEW.winner_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

    const { error: functionError } = await supabase.rpc('exec_sql', { 
      sql: enhancedTriggerSQL 
    });
    
    if (functionError) {
      console.error('Error updating trigger function:', functionError);
    } else {
      console.log('✅ Enhanced trigger function created');
    }

  } catch (error) {
    console.error('Overall error:', error);
  }
}

fixAdvancementToGroupFinals();
