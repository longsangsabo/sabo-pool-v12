const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingGroupBMatchFixed() {
  console.log('🔧 Creating missing Group B Final match (fixed)...\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Check existing Group B matches to get the right match_number
    console.log('1. 🔍 Getting next match number:');
    const { data: existingGroupBMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('match_number')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_final')
      .eq('group_id', 'B')
      .order('match_number', { ascending: false });

    const nextMatchNumber = existingGroupBMatches && existingGroupBMatches.length > 0 
      ? Math.max(...existingGroupBMatches.map(m => m.match_number || 0)) + 1 
      : 1;

    console.log(`Next match number: ${nextMatchNumber}`);

    // 2. Get one existing match to copy structure
    console.log('\n2. 📋 Getting existing match structure:');
    const { data: sampleMatch } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_final')
      .limit(1)
      .single();

    if (sampleMatch) {
      console.log('Sample match structure:', Object.keys(sampleMatch));
    }

    // 3. Create the new match with all required fields
    console.log('\n3. 🚀 Creating new Group B Final match:');
    
    const player1Id = '69f8b59e-5531-4f3b-9d87-174e2e7bf8ea';
    const player2Id = 'f4bf9554-f2a7-4aee-8ba3-7c38b89771ca';
    
    const newMatch = {
      tournament_id: tournamentId,
      group_id: 'B',
      bracket_type: 'group_b_final',
      round_number: 250,
      match_number: nextMatchNumber,
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

    console.log('Match data to insert:');
    Object.entries(newMatch).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    const { data: insertedMatch, error: insertError } = await serviceSupabase
      .from('sabo32_matches')
      .insert([newMatch])
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Error creating match:', insertError);
      return;
    }

    console.log('\n✅ Match created successfully!');
    console.log(`  Match ID: ${insertedMatch.match_id || insertedMatch.id}`);
    console.log(`  Match Number: ${insertedMatch.match_number}`);
    console.log(`  Players: ${player1Id} vs ${player2Id}`);
    console.log(`  Type: ${insertedMatch.bracket_type}`);
    console.log(`  Group: ${insertedMatch.group_id}`);
    console.log(`  Round: ${insertedMatch.round_number}`);

    // 4. Get player names
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

    // 5. Verify the fix
    console.log('\n4. ✅ Verification:');
    const { data: allGroupBFinals } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_final')
      .eq('group_id', 'B');

    console.log(`Group B Final matches now: ${allGroupBFinals?.length || 0}`);
    
    const { data: allGroupAFinals } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_a_final')
      .eq('group_id', 'A');

    console.log(`Group A Final matches: ${allGroupAFinals?.length || 0}`);
    console.log(`✅ Groups now balanced: ${allGroupBFinals?.length === allGroupAFinals?.length ? 'YES' : 'NO'}`);

    console.log('\n🎉 Group B Final structure fixed!');
    console.log('   The missing match has been created and should now appear in the frontend.');
    console.log('   Please refresh the Group Final view to see the new match.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createMissingGroupBMatchFixed();
