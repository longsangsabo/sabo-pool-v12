import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSABOFunctions() {
  console.log('🧪 Testing SABO 10 Functions System...\n');
  
  // Get tournament with completed Round 1
  const tournamentId = 'c41300b2-e63f-4a08-9a32-0ee096c86b6d';
  
  console.log('🎯 Tournament ID:', tournamentId);
  console.log('📊 Expected after Round 1 completion:');
  console.log('   - Round 1 Winners → Round 2 (Winners Bracket)');
  console.log('   - Round 1 Losers → Round 101 (Losers Branch A)\n');
  
  // Test function: process_winners_round2_completion (should have been triggered)
  console.log('🔧 Testing process_winners_round2_completion...');
  try {
    const { data, error } = await supabase.rpc('process_winners_round2_completion', {
      p_tournament_id: tournamentId
    });
    
    if (error) {
      console.error('❌ Function error:', error);
    } else {
      console.log('✅ Function response:', data);
    }
  } catch (err) {
    console.error('❌ Function call failed:', err.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test function: process_losers_r101_completion  
  console.log('🔧 Testing process_losers_r101_completion...');
  try {
    const { data, error } = await supabase.rpc('process_losers_r101_completion', {
      p_tournament_id: tournamentId
    });
    
    if (error) {
      console.error('❌ Function error:', error);
    } else {
      console.log('✅ Function response:', data);
    }
  } catch (err) {
    console.error('❌ Function call failed:', err.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Check current tournament status
  console.log('📊 Current tournament match status:');
  const { data: matches, error: matchError } = await supabase
    .from('tournament_matches')
    .select('id, round_number, match_number, player1_id, player2_id, status, bracket_type, branch_type')
    .eq('tournament_id', tournamentId)
    .order('round_number')
    .order('match_number');
    
  if (matchError) {
    console.error('❌ Cannot get matches:', matchError);
    return;
  }
  
  // Group by rounds
  const rounds = matches.reduce((acc, match) => {
    const key = `${match.bracket_type}_${match.round_number}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});
  
  Object.keys(rounds).sort().forEach(roundKey => {
    const roundMatches = rounds[roundKey];
    const sampleMatch = roundMatches[0];
    
    console.log(`\n🎮 ${sampleMatch.bracket_type.toUpperCase()} Round ${sampleMatch.round_number}:`);
    console.log(`   Matches: ${roundMatches.length}`);
    console.log(`   Status: ${roundMatches.map(m => m.status).join(', ')}`);
    console.log(`   Players: ${roundMatches.filter(m => m.player1_id && m.player2_id).length}/${roundMatches.length} have both players`);
    
    // Show first few matches details
    roundMatches.slice(0, 2).forEach(match => {
      const p1 = match.player1_id ? match.player1_id.substring(0, 8) + '...' : 'TBD';
      const p2 = match.player2_id ? match.player2_id.substring(0, 8) + '...' : 'TBD';
      console.log(`   Match ${match.match_number}: ${p1} vs ${p2} (${match.status})`);
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 DIAGNOSIS:');
  
  const round1Matches = rounds['winner_1'] || [];
  const round2Matches = rounds['winner_2'] || [];
  const losersR101Matches = rounds['loser_101'] || [];
  
  const round1Completed = round1Matches.filter(m => m.status === 'completed').length;
  const round2WithPlayers = round2Matches.filter(m => m.player1_id && m.player2_id).length;
  const losersR101WithPlayers = losersR101Matches.filter(m => m.player1_id && m.player2_id).length;
  
  console.log(`- Round 1 completed: ${round1Completed}/${round1Matches.length}`);
  console.log(`- Round 2 with players: ${round2WithPlayers}/${round2Matches.length}`);
  console.log(`- Losers R101 with players: ${losersR101WithPlayers}/${losersR101Matches.length}`);
  
  if (round1Completed === round1Matches.length && round2WithPlayers === 0) {
    console.log('\n❌ ISSUE: Round 1 complete but Round 2 empty → process_winners_round2_completion NOT WORKING');
  }
  
  if (round1Completed === round1Matches.length && losersR101WithPlayers === 0) {
    console.log('❌ ISSUE: Round 1 complete but Losers R101 empty → process_losers_r101_completion NOT WORKING');
  }
}

testSABOFunctions().catch(console.error);
