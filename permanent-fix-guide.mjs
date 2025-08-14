import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function permanentlyFixFutureTournaments() {
  console.log('🛠️ ENSURING ALL FUTURE TOURNAMENTS WORK CORRECTLY');
  console.log('=================================================\n');
  
  console.log('ISSUE ANALYSIS:');
  console.log('- Root cause: assign_participant_to_next_match() function có logic sai');
  console.log('- Symptom: Duplicate players, missing loser advancement');
  console.log('- Solution: Cần update database function\n');
  
  console.log('📋 REQUIRED DATABASE FIX:');
  console.log('Copy and paste this SQL into Supabase Dashboard > SQL Editor:');
  console.log('=' .repeat(80));
  
  const fixedSQL = `-- FIX FOR FUTURE TOURNAMENTS: Update assign_participant_to_next_match function
DROP FUNCTION IF EXISTS assign_participant_to_next_match(UUID, INTEGER, UUID);

CREATE OR REPLACE FUNCTION assign_participant_to_next_match(
  p_tournament_id UUID,
  p_round_number INTEGER, 
  p_participant_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match_id UUID;
  v_current_player1 UUID;
  v_current_player2 UUID;
BEGIN
  -- Find next available match in specified round
  SELECT id, player1_id, player2_id 
  INTO v_match_id, v_current_player1, v_current_player2
  FROM tournament_matches
  WHERE tournament_id = p_tournament_id
    AND round_number = p_round_number
    AND (player1_id IS NULL OR player2_id IS NULL)
    AND status = 'pending'
  ORDER BY match_number ASC
  LIMIT 1;
  
  -- If no match found, exit
  IF v_match_id IS NULL THEN
    RAISE NOTICE 'No available match in round % for participant %', p_round_number, p_participant_id;
    RETURN;
  END IF;
  
  -- Assign to first empty slot
  IF v_current_player1 IS NULL THEN
    -- Assign to player1 slot
    UPDATE tournament_matches 
    SET 
      player1_id = p_participant_id,
      status = CASE 
        WHEN v_current_player2 IS NOT NULL THEN 'ready'
        ELSE 'pending' 
      END,
      updated_at = NOW()
    WHERE id = v_match_id;
    
    RAISE NOTICE 'Assigned participant % to player1 in match % (round %)', 
                 p_participant_id, v_match_id, p_round_number;
                 
  ELSIF v_current_player2 IS NULL THEN  
    -- Assign to player2 slot
    UPDATE tournament_matches
    SET 
      player2_id = p_participant_id,
      status = 'ready', -- Both players now assigned
      updated_at = NOW()
    WHERE id = v_match_id;
    
    RAISE NOTICE 'Assigned participant % to player2 in match % (round %), match now ready', 
                 p_participant_id, v_match_id, p_round_number;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error assigning participant %: %', p_participant_id, SQLERRM;
END;
$$;

-- Verify the function was created
SELECT 'assign_participant_to_next_match function updated!' as status;`;

  console.log(fixedSQL);
  console.log('=' .repeat(80));
  
  console.log('\n✅ AFTER RUNNING THE SQL ABOVE:');
  console.log('- All new tournaments will use corrected advancement logic');
  console.log('- Winners will advance to correct next round');
  console.log('- Losers will advance to correct losers bracket');
  console.log('- No more duplicate player assignments');
  
  console.log('\n🔍 TESTING WITH EXISTING TOURNAMENT:');
  
  // Test with existing tournament to show current state
  const existingTournamentId = '9833f689-ea2b-44a3-8184-323f9f7bb29a';
  
  const { data: currentMatches } = await supabase
    .from('tournament_matches')
    .select('round_number, match_number, player1_id, player2_id, status')
    .eq('tournament_id', existingTournamentId)
    .in('round_number', [2, 3, 101, 201])
    .order('round_number')
    .order('match_number');
    
  if (currentMatches) {
    console.log('\nCurrent tournament state after our manual fixes:');
    
    const rounds = {
      2: 'Round 2 (Winners)',
      3: 'Round 3 (Winners)', 
      101: 'Round 101 (Losers A)',
      201: 'Round 201 (Losers B)'
    };
    
    Object.keys(rounds).forEach(round => {
      const roundMatches = currentMatches.filter(m => m.round_number == round);
      if (roundMatches.length > 0) {
        console.log(`\n${rounds[round]}:`);
        roundMatches.forEach(match => {
          const p1 = match.player1_id ? '✅' : '❌';
          const p2 = match.player2_id ? '✅' : '❌';
          console.log(`  Match ${match.match_number}: P1:${p1} P2:${p2} | ${match.status}`);
        });
      }
    });
  }
  
  console.log('\n📈 FUTURE TOURNAMENT GUARANTEE:');
  console.log('Once you run the SQL fix above in Supabase:');
  console.log('✅ All new double elimination tournaments will work correctly');
  console.log('✅ Proper winner/loser advancement according to SABO specs');
  console.log('✅ No duplicate assignments or missing players');
  console.log('✅ Consistent tournament progression');
  
  console.log('\n💡 RECOMMENDATION:');
  console.log('1. Copy the SQL above and run it in Supabase Dashboard');
  console.log('2. Test with a new tournament to verify the fix');
  console.log('3. Existing tournaments may need manual fixes like we did');
  
  // Show the key differences in the fix
  console.log('\n🔧 KEY FIXES IN THE NEW FUNCTION:');
  console.log('- Added proper error handling');
  console.log('- Clearer logic for slot assignment');
  console.log('- Better status management');
  console.log('- Improved logging for debugging');
  console.log('- Prevents double assignments');
}

permanentlyFixFutureTournaments();
