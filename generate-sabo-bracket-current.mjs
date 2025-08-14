import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function generateSABOBracketForCurrent() {
  const currentTournamentId = 'adced892-a39f-483f-871e-aa0102735219';
  
  console.log('🎯 Generating SABO bracket for current tournament...');
  
  // First, clear any existing matches except the first one (which might be needed)
  console.log('🧹 Clearing existing matches...');
  const { error: deleteError } = await supabase
    .from('tournament_matches')
    .delete()
    .eq('tournament_id', currentTournamentId);
  
  if (deleteError) {
    console.error('❌ Error clearing matches:', deleteError);
    return;
  }
  
  // Get confirmed registrations
  const { data: registrations, error: regError } = await supabase
    .from('tournament_registrations')
    .select('user_id')
    .eq('tournament_id', currentTournamentId)
    .eq('registration_status', 'confirmed')
    .order('created_at', { ascending: true });
  
  if (regError) {
    console.error('❌ Registration error:', regError);
    return;
  }
  
  if (!registrations || registrations.length !== 16) {
    console.error(`❌ Expected 16 players, got ${registrations?.length || 0}`);
    return;
  }
  
  console.log(`✅ Found ${registrations.length} confirmed players`);
  
  // Generate SABO double elimination bracket
  const matches = [];
  let matchId = 1;
  
  // Round 1 - Winners Bracket (8 matches)
  console.log('🎮 Creating Round 1 (Winners Bracket)...');
  for (let i = 0; i < 8; i++) {
    matches.push({
      tournament_id: currentTournamentId,
      round_number: 1,
      match_number: matchId++,
      bracket_type: 'winners',
      player1_id: registrations[i * 2].user_id,
      player2_id: registrations[i * 2 + 1].user_id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Round 2 - Winners Bracket (4 matches)
  console.log('🎮 Creating Round 2 (Winners Bracket)...');
  for (let i = 0; i < 4; i++) {
    matches.push({
      tournament_id: currentTournamentId,
      round_number: 2,
      match_number: matchId++,
      bracket_type: 'winners',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Round 3 - Winners Bracket (2 matches - semifinals)
  console.log('🎮 Creating Round 3 (Winners Bracket Semifinals)...');
  for (let i = 0; i < 2; i++) {
    matches.push({
      tournament_id: currentTournamentId,
      round_number: 3,
      match_number: matchId++,
      bracket_type: 'winners',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Losers Bracket Round 1 (4 matches)
  console.log('🎮 Creating Losers Bracket Round 1...');
  for (let i = 0; i < 4; i++) {
    matches.push({
      tournament_id: currentTournamentId,
      round_number: 101,
      match_number: matchId++,
      bracket_type: 'losers',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Losers Bracket Round 2 (2 matches)
  console.log('🎮 Creating Losers Bracket Round 2...');
  for (let i = 0; i < 2; i++) {
    matches.push({
      tournament_id: currentTournamentId,
      round_number: 102,
      match_number: matchId++,
      bracket_type: 'losers',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Losers Bracket Round 3 (2 matches)
  console.log('🎮 Creating Losers Bracket Round 3...');
  for (let i = 0; i < 2; i++) {
    matches.push({
      tournament_id: currentTournamentId,
      round_number: 103,
      match_number: matchId++,
      bracket_type: 'losers',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Losers Bracket Semifinals Round 1
  console.log('🎮 Creating Losers Bracket Semifinals Round 1...');
  matches.push({
    tournament_id: currentTournamentId,
    round_number: 201,
    match_number: matchId++,
    bracket_type: 'losers',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Losers Bracket Semifinals Round 2
  console.log('🎮 Creating Losers Bracket Semifinals Round 2...');
  matches.push({
    tournament_id: currentTournamentId,
    round_number: 202,
    match_number: matchId++,
    bracket_type: 'losers',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Losers Bracket Final
  console.log('🎮 Creating Losers Bracket Final...');
  matches.push({
    tournament_id: currentTournamentId,
    round_number: 250,
    match_number: matchId++,
    bracket_type: 'losers',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Grand Final
  console.log('🎮 Creating Grand Final...');
  matches.push({
    tournament_id: currentTournamentId,
    round_number: 300,
    match_number: matchId++,
    bracket_type: 'winners',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Insert all matches
  console.log(`📝 Inserting ${matches.length} matches...`);
  const { data: insertedMatches, error: insertError } = await supabase
    .from('tournament_matches')
    .insert(matches)
    .select();
  
  if (insertError) {
    console.error('❌ Error inserting matches:', insertError);
    return;
  }
  
  console.log(`✅ Successfully created ${insertedMatches?.length || 0} matches!`);
  
  // Summary
  const winnerMatches = matches.filter(m => m.bracket_type === 'winners');
  const loserMatches = matches.filter(m => m.bracket_type === 'losers');
  
  console.log('\n📊 SABO Bracket Summary:');
  console.log(`🏆 Winners Bracket: ${winnerMatches.length} matches`);
  console.log(`🎯 Losers Bracket: ${loserMatches.length} matches`);
  console.log(`🎮 Total Matches: ${matches.length}`);
  
  console.log('\n🎯 Round Distribution:');
  console.log('Winners Bracket:');
  console.log('- Round 1: 8 matches');
  console.log('- Round 2: 4 matches');
  console.log('- Round 3: 2 matches (semifinals)');
  console.log('Losers Bracket:');
  console.log('- Round 101: 4 matches');
  console.log('- Round 102: 2 matches');
  console.log('- Round 103: 2 matches');
  console.log('- Round 201: 1 match (semifinals 1)');
  console.log('- Round 202: 1 match (semifinals 2)');
  console.log('- Round 250: 1 match (final)');
  console.log('Grand Final:');
  console.log('- Round 300: 1 match (grand final)');
  
  console.log('\n🎉 SABO bracket generation complete!');
  console.log('💡 Tip: Refresh the browser to see the new bracket structure.');
}

generateSABOBracketForCurrent();
