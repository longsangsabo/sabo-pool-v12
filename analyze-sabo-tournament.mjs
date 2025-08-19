import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeSABOTournament() {
  console.log('🔍 Analyzing ACTUAL tournament_matches data...');
  
  try {
    // Get all tournaments in the table
    const { data: allMatches, error } = await supabase
      .from('tournament_matches')
      .select('tournament_id, bracket_type, round_number, match_number, status, player1_id, player2_id, winner_id, player1_score, player2_score')
      .order('tournament_id')
      .order('round_number')
      .order('match_number');
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (!allMatches || allMatches.length === 0) {
      console.log('⚠️ No matches found in tournament_matches table');
      return;
    }
    
    // Group by tournament
    const tournamentGroups = {};
    allMatches.forEach(match => {
      if (!tournamentGroups[match.tournament_id]) {
        tournamentGroups[match.tournament_id] = [];
      }
      tournamentGroups[match.tournament_id].push(match);
    });
    
    console.log(`\n📊 Found ${Object.keys(tournamentGroups).length} tournament(s) in tournament_matches:`);
    
    Object.entries(tournamentGroups).forEach(([tournamentId, matches]) => {
      console.log(`\n🏆 Tournament: ${tournamentId}`);
      console.log(`📋 Total matches: ${matches.length}`);
      
      // Analyze structure
      const rounds = {};
      const brackets = {};
      const statuses = {};
      
      matches.forEach(match => {
        // Group by round
        const roundKey = `${match.bracket_type}_R${match.round_number}`;
        if (!rounds[roundKey]) rounds[roundKey] = [];
        rounds[roundKey].push(match);
        
        // Count brackets
        brackets[match.bracket_type] = (brackets[match.bracket_type] || 0) + 1;
        
        // Count statuses
        statuses[match.status] = (statuses[match.status] || 0) + 1;
      });
      
      console.log(`\n📈 Bracket breakdown:`);
      Object.entries(brackets).forEach(([bracket, count]) => {
        console.log(`   ${bracket}: ${count} matches`);
      });
      
      console.log(`\n📊 Status breakdown:`);
      Object.entries(statuses).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} matches`);
      });
      
      console.log(`\n🔄 Round breakdown:`);
      Object.entries(rounds).forEach(([round, roundMatches]) => {
        console.log(`   ${round}: ${roundMatches.length} matches`);
        roundMatches.forEach(match => {
          const p1 = match.player1_id ? match.player1_id.substring(0,8) : 'TBD';
          const p2 = match.player2_id ? match.player2_id.substring(0,8) : 'TBD';
          const score = match.status === 'completed' ? 
            `${match.player1_score || 0}-${match.player2_score || 0}` : 
            'pending';
          console.log(`     M${match.match_number}: ${p1} vs ${p2} (${score}) [${match.status}]`);
        });
      });
      
      // Check advancement issues
      console.log(`\n🔍 Advancement Analysis:`);
      const round1Completed = matches.filter(m => m.round_number === 1 && m.status === 'completed');
      const round2WithPlayers = matches.filter(m => m.round_number === 2 && (m.player1_id || m.player2_id));
      const losersWithPlayers = matches.filter(m => m.bracket_type === 'loser' && (m.player1_id || m.player2_id));
      
      console.log(`   Round 1 completed: ${round1Completed.length} matches`);
      console.log(`   Round 2 with players: ${round2WithPlayers.length} matches`);
      console.log(`   Losers bracket with players: ${losersWithPlayers.length} matches`);
      
      if (round1Completed.length > 0 && round2WithPlayers.length === 0) {
        console.log('   ❌ ISSUE: Round 1 completed but Round 2 has no players - ADVANCEMENT FAILED');
      }
      
      if (round1Completed.length > 0 && losersWithPlayers.length === 0) {
        console.log('   ❌ ISSUE: Round 1 completed but Losers bracket has no players - ADVANCEMENT FAILED');
      }
    });
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

analyzeSABOTournament();
