const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixTournamentLogicFlow() {
  console.log('🔧 FIXING TOURNAMENT LOGIC FLOW BASED ON DEEP ANALYSIS\n');
  console.log('=' .repeat(80));
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // ISSUE IDENTIFIED: Cross-Bracket has players but Group A Finals are incomplete
    console.log('📋 IDENTIFIED ISSUE:');
    console.log('   Cross-Bracket Semifinals have players assigned');
    console.log('   BUT Group A Finals are still pending');
    console.log('   This violates the correct tournament flow\n');
    
    // STEP 1: Reset Cross-Bracket to correct state
    console.log('1. 🔄 RESETTING CROSS-BRACKET TO PENDING STATE:');
    
    const { error: resetCrossError } = await serviceSupabase
      .from('sabo32_matches')
      .update({
        player1_id: null,
        player2_id: null,
        winner_id: null,
        score_player1: null,
        score_player2: null,
        status: 'pending',
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournamentId)
      .in('bracket_type', ['cross_semifinals', 'cross_final']);

    if (resetCrossError) {
      console.error('❌ Error resetting Cross-Bracket:', resetCrossError);
    } else {
      console.log('✅ Cross-Bracket matches reset to pending');
    }

    // STEP 2: Properly set up Group A Finals
    console.log('\n2. 🏆 SETTING UP GROUP A FINALS CORRECTLY:');
    
    // Get Group A Winners Champion (Round 3 winner)
    const { data: groupAWinnersR3 } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_winners')
      .eq('round_number', 3)
      .order('match_number');

    console.log(`Group A Winners Round 3 matches: ${groupAWinnersR3?.length || 0}`);
    
    // Check if we have 2 Round 3 matches (semifinals)
    if (groupAWinnersR3?.length === 2) {
      const match1Winner = groupAWinnersR3[0].winner_id;
      const match2Winner = groupAWinnersR3[1].winner_id;
      
      console.log(`   R3 Match 1 Winner: ${match1Winner || 'None'}`);
      console.log(`   R3 Match 2 Winner: ${match2Winner || 'None'}`);
      
      // If both Round 3 matches are completed, set up Winners Final
      if (match1Winner && match2Winner) {
        console.log('   Both R3 matches completed - setting up Winners Final');
        
        // Find or create Winners Final match
        let { data: winnersFinal } = await serviceSupabase
          .from('sabo32_matches')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('bracket_type', 'group_a_winners')
          .eq('round_number', 4)
          .single();

        if (!winnersFinal) {
          // Create Winners Final if it doesn't exist
          console.log('   Creating Group A Winners Final...');
          const { data: newWinnersFinal, error: createError } = await serviceSupabase
            .from('sabo32_matches')
            .insert({
              tournament_id: tournamentId,
              group_id: 'A',
              bracket_type: 'group_a_winners',
              round_number: 4,
              match_number: 1,
              sabo_match_id: 'A-WF',
              player1_id: match1Winner,
              player2_id: match2Winner,
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('*')
            .single();

          if (createError) {
            console.error('❌ Error creating Winners Final:', createError);
          } else {
            winnersFinal = newWinnersFinal;
            console.log('✅ Group A Winners Final created');
          }
        } else {
          // Update existing Winners Final
          const { error: updateError } = await serviceSupabase
            .from('sabo32_matches')
            .update({
              player1_id: match1Winner,
              player2_id: match2Winner,
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', winnersFinal.id);

          if (updateError) {
            console.error('❌ Error updating Winners Final:', updateError);
          } else {
            console.log('✅ Group A Winners Final updated');
          }
        }
      }
    }

    // Get Group A Losers Champion (highest round in losers_b completed)
    const { data: groupALosersChamp } = await serviceSupabase
      .from('sabo32_matches')
      .select('winner_id')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_losers_b')
      .eq('round_number', 202)
      .single();

    console.log(`   Group A Losers Champion: ${groupALosersChamp?.winner_id || 'None'}`);

    // STEP 3: Create proper advancement function
    console.log('\n3. 🛠️ CREATING CORRECT ADVANCEMENT FUNCTION:');
    
    const correctAdvancementSQL = `
    CREATE OR REPLACE FUNCTION public.fix_group_a_advancement()
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_tournament_id UUID := '${tournamentId}';
      v_winners_champ UUID;
      v_losers_champ UUID;
      v_result JSONB;
    BEGIN
      -- Get Group A Winners Champion (from Winners Final or R3 if only 1 winner)
      SELECT winner_id INTO v_winners_champ
      FROM sabo32_matches
      WHERE tournament_id = v_tournament_id
        AND bracket_type = 'group_a_winners'
        AND round_number = (SELECT MAX(round_number) FROM sabo32_matches 
                           WHERE tournament_id = v_tournament_id 
                             AND bracket_type = 'group_a_winners'
                             AND status = 'completed')
        AND status = 'completed'
      LIMIT 1;
      
      -- Get Group A Losers Champion
      SELECT winner_id INTO v_losers_champ
      FROM sabo32_matches
      WHERE tournament_id = v_tournament_id
        AND bracket_type = 'group_a_losers_b'
        AND round_number = 202
        AND status = 'completed';
      
      -- If both champions exist, set up Group A Final
      IF v_winners_champ IS NOT NULL AND v_losers_champ IS NOT NULL THEN
        UPDATE sabo32_matches
        SET player1_id = v_winners_champ,
            player2_id = v_losers_champ,
            status = 'pending',
            updated_at = NOW()
        WHERE tournament_id = v_tournament_id
          AND bracket_type = 'group_a_final'
          AND match_number = 1;
          
        v_result := jsonb_build_object(
          'success', true,
          'winners_champ', v_winners_champ,
          'losers_champ', v_losers_champ,
          'message', 'Group A Final set up successfully'
        );
      ELSE
        v_result := jsonb_build_object(
          'success', false,
          'winners_champ', v_winners_champ,
          'losers_champ', v_losers_champ,
          'message', 'Missing champions for Group A Final'
        );
      END IF;
      
      RETURN v_result;
    END;
    $$;
    `;

    console.log('   Creating fix function...');
    // Note: In production, this would be executed via database migration

    // STEP 4: Manual fix for current state
    console.log('\n4. 🔧 APPLYING MANUAL FIX:');
    
    // Get the highest completed round winners
    const { data: highestWinners } = await serviceSupabase
      .from('sabo32_matches')
      .select('winner_id')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_winners')
      .eq('round_number', 3)
      .order('match_number')
      .limit(1);

    const winnersChamp = highestWinners?.[0]?.winner_id;
    const losersChamp = groupALosersChamp?.winner_id;

    if (winnersChamp && losersChamp) {
      console.log('   Setting up Group A Final with available champions...');
      
      const { error: setupError } = await serviceSupabase
        .from('sabo32_matches')
        .update({
          player1_id: winnersChamp,
          player2_id: losersChamp,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('tournament_id', tournamentId)
        .eq('bracket_type', 'group_a_final')
        .eq('match_number', 1);

      if (setupError) {
        console.error('❌ Error setting up Group A Final:', setupError);
      } else {
        console.log('✅ Group A Final set up successfully');
        
        // Get player names
        const { data: wc } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', winnersChamp)
          .single();
        
        const { data: lc } = await serviceSupabase
          .from('sabo32_tournament_players')
          .select('player_name')
          .eq('player_id', losersChamp)
          .single();

        console.log(`   Matchup: ${wc?.player_name || 'Unknown'} vs ${lc?.player_name || 'Unknown'}`);
      }
    }

    // STEP 5: Verify fix
    console.log('\n5. ✅ VERIFICATION:');
    
    const { data: verifyGroupA } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_final');

    console.log('Group A Finals status:');
    verifyGroupA?.forEach(match => {
      const hasPlayers = match.player1_id && match.player2_id;
      console.log(`   Match ${match.match_number}: ${hasPlayers ? '✅' : '❌'} Players assigned`);
    });

    const { data: verifyCross } = await serviceSupabase
      .from('sabo32_matches')
      .select('player1_id, player2_id')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'cross_semifinals');

    const crossHasPlayers = verifyCross?.some(m => m.player1_id || m.player2_id);
    console.log(`Cross-Bracket has players: ${crossHasPlayers ? '⚠️ Still has players' : '✅ Reset correctly'}`);

    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Complete Group A Finals');
    console.log('   2. Auto-advancement will trigger Cross-Bracket setup');
    console.log('   3. Tournament can proceed with correct logic flow');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixTournamentLogicFlow();
