const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingGroupBMatch() {
  console.log('🔧 Creating missing Group B Final match...\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Get player names first for confirmation
    console.log('1. 👥 Getting player names:');
    
    const player1Id = '69f8b59e-5531-4f3b-9d87-174e2e7bf8ea';
    const player2Id = 'f4bf9554-f2a7-4aee-8ba3-7c38b89771ca';
    
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

    console.log(`Player 1: ${p1?.player_name || 'Unknown'} (${player1Id})`);
    console.log(`Player 2: ${p2?.player_name || 'Unknown'} (${player2Id})`);

    // 2. Check if match already exists
    console.log('\n2. 🔍 Checking if match already exists:');
    const { data: existingMatch } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'group_b_final')
      .eq('group_id', 'B')
      .or(`and(player1_id.eq.${player1Id},player2_id.eq.${player2Id}),and(player1_id.eq.${player2Id},player2_id.eq.${player1Id})`);

    if (existingMatch && existingMatch.length > 0) {
      console.log('⚠️ Match already exists!');
      existingMatch.forEach(match => {
        console.log(`  Match ${match.match_id}: ${match.player1_id} vs ${match.player2_id}`);
      });
      return;
    }

    console.log('✅ No existing match found, safe to create');

    // 3. Create the new match
    console.log('\n3. 🚀 Creating new Group B Final match:');
    
    const newMatch = {
      tournament_id: tournamentId,
      bracket_type: 'group_b_final',
      group_id: 'B',
      round_number: 250,
      player1_id: player1Id,
      player2_id: player2Id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Match data to insert:', newMatch);

    const { data: insertedMatch, error: insertError } = await serviceSupabase
      .from('sabo32_matches')
      .insert([newMatch])
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Error creating match:', insertError);
      return;
    }

    console.log('✅ Match created successfully!');
    console.log(`  Match ID: ${insertedMatch.match_id || insertedMatch.id}`);
    console.log(`  Players: ${p1?.player_name} vs ${p2?.player_name}`);
    console.log(`  Type: ${insertedMatch.bracket_type}`);
    console.log(`  Group: ${insertedMatch.group_id}`);
    console.log(`  Round: ${insertedMatch.round_number}`);

    // 4. Verify the fix
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

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createMissingGroupBMatch();
