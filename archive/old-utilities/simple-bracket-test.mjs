import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function simpleBracketTest() {
  console.log('🔍 Simple bracket test...\n');
  
  try {
    // Get tournament with matches  
    const tournamentId = 'adced892-a39f-483f-871e-aa0102735219'; // test 1
    
    console.log(`🎯 Testing tournament: ${tournamentId}`);
    
    // Get matches without foreign keys first
    const { data: matches, error: matchError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number')
      .order('match_number');
      
    if (matchError) {
      console.error('❌ Match error:', matchError);
      return;
    }
    
    console.log(`📋 Found ${matches.length} matches:`);
    matches.forEach(match => {
      console.log(`   R${match.round_number}M${match.match_number}: ${match.player1_id?.substring(0,8)} vs ${match.player2_id?.substring(0,8)} (${match.status})`);
      console.log(`      Score: ${match.score_player1}-${match.score_player2}`);
      console.log(`      Winner: ${match.winner_id?.substring(0,8) || 'none'}`);
      console.log(`      Bracket: ${match.bracket_type}, Branch: ${match.branch_type}`);
    });
    
    console.log(`\n✅ Tournament URL: http://localhost:8080/tournament-management/${tournamentId}`);
    
    // Test what DoubleBracketVisualization would receive
    const winnerMatches = matches.filter(m => m.bracket_type === 'winner');
    const loserMatches = matches.filter(m => m.bracket_type === 'loser');
    
    console.log(`\n📊 Analysis for DoubleBracketVisualization:`);
    console.log(`   - Winner bracket: ${winnerMatches.length} matches`);
    console.log(`   - Loser bracket: ${loserMatches.length} matches`);
    console.log(`   - Total: ${matches.length} matches`);
    
    if (matches.length > 0) {
      console.log(`\n🎯 First match data structure:`);
      console.log(JSON.stringify(matches[0], null, 2));
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

simpleBracketTest();
