import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugMatches() {
  console.log('🔍 Debugging Tournament Matches...\n');
  
  // 1. Check tournaments
  const { data: tournaments, error: tourError } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (tourError) {
    console.error('❌ Error fetching tournaments:', tourError);
    return;
  }
  
  console.log('📊 Recent Tournaments:');
  tournaments.forEach(t => {
    console.log(`- ${t.name} (${t.id}) - Type: ${t.tournament_type} - Status: ${t.status}`);
  });
  
  if (tournaments.length === 0) {
    console.log('❌ No tournaments found');
    return;
  }
  
  const latestTournament = tournaments[0];
  console.log(`\n🎯 Checking matches for tournament: ${latestTournament.name}`);
  
  // 2. Check tournament_matches
  const { data: matches, error: matchError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', latestTournament.id)
    .order('round_number');
    
  if (matchError) {
    console.error('❌ Error fetching matches:', matchError);
    return;
  }
  
  console.log(`\n📋 Found ${matches.length} matches:`);
  if (matches.length === 0) {
    console.log('❌ No matches found for this tournament');
  } else {
    matches.forEach(match => {
      console.log(`- Match ${match.match_number}: Round ${match.round_number}, ${match.bracket_type || 'N/A'}`);
      console.log(`  Players: ${match.player1_id || 'TBD'} vs ${match.player2_id || 'TBD'}`);
      console.log(`  Score: ${match.player1_score || 0}-${match.player2_score || 0}, Winner: ${match.winner_id || 'N/A'}`);
    });
  }
  
  // 3. Check tournament participants
  const { data: participants, error: partError } = await supabase
    .from('tournament_registrations')
    .select('*')
    .eq('tournament_id', latestTournament.id)
    .eq('registration_status', 'confirmed');
    
  if (partError) {
    console.error('❌ Error fetching participants:', partError);
  } else {
    console.log(`\n👥 Confirmed participants: ${participants.length}`);
  }
  
  // 4. Check if it's SABO tournament type
  console.log(`\n🏆 Tournament Type: ${latestTournament.tournament_type}`);
  console.log(`📊 Is SABO Double Elimination: ${latestTournament.tournament_type === 'sabo_double_elimination' || latestTournament.tournament_type === 'sabo_round_robin_double_elimination'}`);
}

debugMatches().catch(console.error);
