const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function generateMatchId() {
  console.log('🔍 Analyzing existing match IDs to create new one...\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Get existing Group B Final matches to see ID pattern
    console.log('1. 📊 Existing Group B Final matches:');
    const { data: existingMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('sabo_match_id, match_number, bracket_type, group_id')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_final')
      .eq('group_id', 'B');

    console.log(`Found ${existingMatches?.length || 0} existing matches:`);
    existingMatches?.forEach((match, index) => {
      console.log(`  ${index + 1}. ID: ${match.sabo_match_id}, Match #: ${match.match_number}`);
    });

    // 2. Get Group A Final matches for comparison
    console.log('\n2. 📊 Group A Final matches for pattern:');
    const { data: groupAMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('sabo_match_id, match_number, bracket_type, group_id')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_final')
      .eq('group_id', 'A');

    console.log(`Found ${groupAMatches?.length || 0} Group A matches:`);
    groupAMatches?.forEach((match, index) => {
      console.log(`  ${index + 1}. ID: ${match.sabo_match_id}, Match #: ${match.match_number}`);
    });

    // 3. Analyze pattern and generate new ID
    console.log('\n3. 🔍 Analyzing ID pattern:');
    
    const allMatches = [...(existingMatches || []), ...(groupAMatches || [])];
    if (allMatches.length > 0) {
      console.log('ID patterns found:');
      allMatches.forEach(match => {
        console.log(`  ${match.sabo_match_id} -> ${match.bracket_type} ${match.group_id} #${match.match_number}`);
      });
      
      // Generate new ID based on pattern
      const nextMatchNumber = Math.max(...existingMatches.map(m => m.match_number || 0)) + 1;
      
      // Common patterns: B-FINAL2, B-FINALM2, etc.
      let newMatchId = `B-FINAL${nextMatchNumber}`;
      
      // Check if this ID already exists
      const { data: existingWithId } = await serviceSupabase
        .from('sabo32_matches')
        .select('sabo_match_id')
        .eq('sabo_match_id', newMatchId);
      
      if (existingWithId && existingWithId.length > 0) {
        newMatchId = `B-FINALM${nextMatchNumber}`;
      }
      
      console.log(`\n💡 Suggested new match ID: ${newMatchId}`);
      
      // 4. Create the match with the new ID
      console.log('\n4. 🚀 Creating match with generated ID:');
      
      const player1Id = '69f8b59e-5531-4f3b-9d87-174e2e7bf8ea';
      const player2Id = 'f4bf9554-f2a7-4aee-8ba3-7c38b89771ca';
      
      const newMatch = {
        tournament_id: tournamentId,
        group_id: 'B',
        bracket_type: 'group_b_final',
        round_number: 250,
        match_number: nextMatchNumber,
        sabo_match_id: newMatchId,
        player1_id: player1Id,
        player2_id: player2Id,
        winner_id: null,
        score_player1: 0,
        score_player2: 0,
        status: 'pending',
        scheduled_at: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating match:', newMatch);

      const { data: insertedMatch, error: insertError } = await serviceSupabase
        .from('sabo32_matches')
        .insert([newMatch])
        .select('*')
        .single();

      if (insertError) {
        console.error('❌ Error creating match:', insertError);
        return;
      }

      console.log('\n✅ SUCCESS! Match created:');
      console.log(`  Match ID: ${insertedMatch.sabo_match_id}`);
      console.log(`  Database ID: ${insertedMatch.id}`);
      console.log(`  Match Number: ${insertedMatch.match_number}`);
      console.log(`  Players: ${player1Id} vs ${player2Id}`);

      // 5. Get player names
      const { data: p1 } = await serviceSupabase
        .from('sabo32_tournament_players')
        .select('player_name')
        .eq('player_id', player1Id)
        .single();
      
      const { data: p2 } = await serviceSupabase
        .from('sabo32_tournament_players')
        .select('player_name')
        .eq('player_id', player2Id)
        .single();

      console.log(`\n👥 Player names: ${p1?.player_name || 'Unknown'} vs ${p2?.player_name || 'Unknown'}`);

      // 6. Final check
      const { data: finalCheck } = await serviceSupabase
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('bracket_type', 'group_b_final')
        .eq('group_id', 'B');

      console.log(`\n🎯 Group B Final matches now: ${finalCheck?.length || 0}`);
      console.log('🎉 Group B Final structure fixed! Refresh the frontend to see the new match.');
      
    } else {
      console.log('❌ No existing matches found to analyze pattern');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateMatchId();
