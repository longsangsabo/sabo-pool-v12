const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igiqzfavlmcijmhqqqra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaXF6ZmF2bG1jaWptaHFxcXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MjI1NzEsImV4cCI6MjA1MDAwNDU3MX0.8_rJMLFWPwT7CxkOjdV0Y_DaZNs7cW7W3RG1cT5Dm94';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournamentBracket() {
  console.log('🔍 Checking tournament bracket status...');
  
  try {
    const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
    
    // Check all matches for this tournament
    console.log('📊 Checking tournament_matches...');
    const { data: allMatches, error: allError } = await supabase
      .from('tournament_matches')
      .select('id, round_number, match_number, status, player1_id, player2_id, winner_id')
      .eq('tournament_id', tournamentId)
      .order('round_number')
      .order('match_number');
    
    if (allError) {
      console.error('❌ Error fetching all matches:', allError);
    } else {
      console.log(`✅ Total tournament matches: ${allMatches?.length || 0}`);
      if (allMatches && allMatches.length > 0) {
        console.log('📋 Match breakdown by round:');
        const rounds = {};
        allMatches.forEach(match => {
          if (!rounds[match.round_number]) rounds[match.round_number] = 0;
          rounds[match.round_number]++;
        });
        console.log(rounds);
        
        console.log('📋 First 5 matches:');
        allMatches.slice(0, 5).forEach(match => {
          console.log(`  Round ${match.round_number}, Match ${match.match_number}: ${match.status}`);
        });
      }
    }
    
    // Check specifically SABO rounds
    console.log('\n🎯 Checking SABO-specific rounds...');
    const { data: saboMatches, error: saboError } = await supabase
      .from('tournament_matches')
      .select('id, round_number, match_number, status')
      .eq('tournament_id', tournamentId)
      .in('round_number', [1, 2, 3, 101, 102, 103, 201, 202, 250, 300])
      .order('round_number')
      .order('match_number');
    
    if (saboError) {
      console.error('❌ Error fetching SABO matches:', saboError);
    } else {
      console.log(`✅ SABO matches found: ${saboMatches?.length || 0}`);
      if (saboMatches && saboMatches.length > 0) {
        console.log('🎯 SABO rounds distribution:');
        const saboRounds = {};
        saboMatches.forEach(match => {
          if (!saboRounds[match.round_number]) saboRounds[match.round_number] = 0;
          saboRounds[match.round_number]++;
        });
        console.log(saboRounds);
      }
    }
    
    // Check tournament info
    console.log('\n🏆 Tournament info:');
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, tournament_type, status, current_participants, max_participants')
      .eq('id', tournamentId)
      .single();
    
    if (tournamentError) {
      console.error('❌ Error fetching tournament:', tournamentError);
    } else {
      console.log('✅ Tournament details:');
      console.log(`  Name: ${tournament.name}`);
      console.log(`  Type: ${tournament.tournament_type}`);
      console.log(`  Status: ${tournament.status}`);
      console.log(`  Participants: ${tournament.current_participants}/${tournament.max_participants}`);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkTournamentBracket();
