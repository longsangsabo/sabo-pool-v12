import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function debugTournamentDisplay() {
  console.log('🔍 Debug tournament bracket display issue...\n');
  
  try {
    // Find tournament with matches
    const { data: matches, error: matchError } = await supabase
      .from('tournament_matches')
      .select(`
        id,
        tournament_id, 
        round_number,
        match_number,
        status,
        player1_id,
        player2_id,
        score_player1,
        score_player2,
        winner_id,
        tournaments!inner(name, tournament_type, status)
      `)
      .limit(10);
      
    if (matchError) {
      console.error('❌ Match error:', matchError);
      return;
    }
    
    console.log(`📊 Found ${matches.length} matches`);
    
    if (matches.length > 0) {
      const tournamentId = matches[0].tournament_id;
      const tournamentName = matches[0].tournaments.name;
      const tournamentType = matches[0].tournaments.tournament_type;
      
      console.log(`\n🎯 Tournament to test: ${tournamentName}`);
      console.log(`   - ID: ${tournamentId}`);
      console.log(`   - Type: ${tournamentType}`);
      console.log(`   - Status: ${matches[0].tournaments.status}`);
      
      // Get all matches for this tournament
      const { data: allMatches, error: allMatchError } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          player1:profiles!tournament_matches_player1_id_fkey(id, full_name, display_name),
          player2:profiles!tournament_matches_player2_id_fkey(id, full_name, display_name)
        `)
        .eq('tournament_id', tournamentId)
        .order('round_number')
        .order('match_number');
        
      if (allMatchError) {
        console.error('❌ All matches error:', allMatchError);
        return;
      }
      
      console.log(`\n📋 All matches for this tournament:`);
      allMatches.forEach(match => {
        const player1Name = match.player1?.full_name || match.player1?.display_name || 'TBD';
        const player2Name = match.player2?.full_name || match.player2?.display_name || 'TBD';
        
        console.log(`   R${match.round_number}M${match.match_number}: ${player1Name} vs ${player2Name} (${match.status})`);
        if (match.status === 'completed') {
          console.log(`      Score: ${match.score_player1}-${match.score_player2}`);
        }
      });
      
      console.log(`\n✅ URL to test bracket display: http://localhost:8080/tournament-management/${tournamentId}`);
      
      // Check if DoubleBracketVisualization can handle this data
      const rounds = [...new Set(allMatches.map(m => m.round_number))].sort();
      console.log(`\n📈 Analysis:`);
      console.log(`   - Rounds: ${rounds.join(', ')}`);
      console.log(`   - Total matches: ${allMatches.length}`);
      console.log(`   - Completed matches: ${allMatches.filter(m => m.status === 'completed').length}`);
      
      // Check for missing player data
      const matchesWithMissingPlayers = allMatches.filter(m => !m.player1_id || !m.player2_id);
      if (matchesWithMissingPlayers.length > 0) {
        console.log(`   ⚠️ ${matchesWithMissingPlayers.length} matches have missing players`);
      }
      
    } else {
      console.log('⚠️ No matches found - brackets cannot display');
      
      // Check tournaments that should have brackets
      const { data: tournaments, error: tourError } = await supabase
        .from('tournaments')
        .select('id, name, tournament_type, status')
        .in('tournament_type', ['double_elimination', 'sabo_double_elimination'])
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (tourError) {
        console.error('❌ Tournament error:', tourError);
        return;
      }
      
      console.log('\n📋 Double elimination tournaments that need brackets:');
      tournaments.forEach(t => {
        console.log(`   - ${t.name} (${t.id.substring(0, 8)}...) - ${t.status}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Debug script error:', error);
  }
}

debugTournamentDisplay();
