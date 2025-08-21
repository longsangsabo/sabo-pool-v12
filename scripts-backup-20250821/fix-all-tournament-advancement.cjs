const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

async function fixTournamentAdvancement(tournamentId) {
  console.log(`🔧 Fixing advancement for tournament ${tournamentId.substring(0,8)}...`);
  
  // Step 1: Check and fix Winners Bracket advancement
  console.log('📈 Checking Winners Bracket advancement...');
  
  // Get all completed Winners Bracket matches
  const { data: winnersMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .gte('round_number', 1)
    .lte('round_number', 3)
    .eq('status', 'completed')
    .order('round_number, match_number');
  
  // Advance winners through Winners Bracket
  for (const match of winnersMatches || []) {
    if (match.winner_id && match.round_number < 3) {
      const nextRound = match.round_number + 1;
      const nextMatchNumber = Math.ceil(match.match_number / 2);
      const isOddMatch = match.match_number % 2 === 1;
      const updateField = isOddMatch ? 'player1_id' : 'player2_id';
      
      const { error } = await supabase
        .from('tournament_matches')
        .update({ [updateField]: match.winner_id })
        .eq('tournament_id', tournamentId)
        .eq('round_number', nextRound)
        .eq('match_number', nextMatchNumber);
        
      if (!error) {
        console.log(`✅ Advanced R${match.round_number} M${match.match_number} winner to R${nextRound} M${nextMatchNumber}`);
      }
    }
  }
  
  // Step 2: Check and fix Losers Bracket advancement  
  console.log('📉 Checking Losers Bracket advancement...');
  
  // Handle R1 losers -> R101
  const r1Matches = winnersMatches?.filter(m => m.round_number === 1) || [];
  for (const match of r1Matches) {
    if (match.winner_id) {
      const loser_id = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
      const losersMatchNumber = match.match_number;
      const isOddMatch = match.match_number % 2 === 1;
      const updateField = isOddMatch ? 'player1_id' : 'player2_id';
      
      const { error } = await supabase
        .from('tournament_matches')
        .update({ [updateField]: loser_id })
        .eq('tournament_id', tournamentId)
        .eq('round_number', 101)
        .eq('match_number', Math.ceil(match.match_number / 2));
        
      if (!error) {
        console.log(`✅ Advanced R${match.round_number} M${match.match_number} loser to Losers R101`);
      }
    }
  }
  
  // Handle R2 losers -> R102
  const r2Matches = winnersMatches?.filter(m => m.round_number === 2) || [];
  for (const match of r2Matches) {
    if (match.winner_id) {
      const loser_id = match.player1_id === match.winner_id ? match.player2_id : match.player1_id;
      
      const { error } = await supabase
        .from('tournament_matches')
        .update({ player2_id: loser_id })
        .eq('tournament_id', tournamentId)
        .eq('round_number', 102)
        .eq('match_number', match.match_number);
        
      if (!error) {
        console.log(`✅ Advanced R${match.round_number} M${match.match_number} loser to Losers R102`);
      }
    }
  }
  
  // Step 3: Fix Finals Stage advancement
  console.log('🏆 Checking Finals Stage advancement...');
  
  // Get Winners R3 results
  const { data: winnersR3 } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 3)
    .order('match_number');
    
  // Get Losers Finals results
  const { data: losersA } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 103)
    .eq('match_number', 1)
    .single();
    
  const { data: losersB } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 203)
    .eq('match_number', 1)
    .single();
  
  // Fix Semifinal 1: R3 M1 winner vs Losers A Champion
  if (winnersR3?.[0]?.winner_id && losersA?.winner_id) {
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        player1_id: winnersR3[0].winner_id,
        player2_id: losersA.winner_id,
        status: 'pending'
      })
      .eq('tournament_id', tournamentId)
      .eq('round_number', 250)
      .eq('match_number', 1);
      
    if (!error) {
      console.log('✅ Fixed Semifinal 1');
    }
  }
  
  // Fix Semifinal 2: R3 M2 winner vs Losers B Champion  
  if (winnersR3?.[1]?.winner_id) {
    const updateData = {
      player1_id: winnersR3[1].winner_id,
      status: losersB?.winner_id ? 'pending' : 'waiting_for_players'
    };
    
    if (losersB?.winner_id) {
      updateData.player2_id = losersB.winner_id;
    }
    
    const { error } = await supabase
      .from('tournament_matches')
      .update(updateData)
      .eq('tournament_id', tournamentId)
      .eq('round_number', 250)
      .eq('match_number', 2);
      
    if (!error) {
      console.log('✅ Fixed Semifinal 2');
    }
  }
  
  console.log('✅ Tournament advancement fixed!');
}

(async () => {
  console.log('🔍 Finding tournaments that need advancement fixes...');
  
  // Find recent tournaments that might have advancement issues
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
    
  for (const tournament of tournaments || []) {
    console.log(`\\n🏆 Checking tournament: ${tournament.name}`);
    await fixTournamentAdvancement(tournament.id);
  }
  
  console.log('\\n🎯 All tournaments checked and fixed!');
})();
