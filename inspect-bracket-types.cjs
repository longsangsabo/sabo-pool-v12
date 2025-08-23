require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function inspectBracketTypes() {
  console.log('🔍 Inspect bracket types và round numbers...\n');

  try {
    const { data: matches, error } = await supabase
      .from('sabo32_matches')
      .select('bracket_type, round_number, group_id, sabo_match_id, status, player1_id, player2_id, winner_id')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .order('group_id')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');

    if (error) {
      console.log('❌ Error:', error);
      return;
    }

    console.log(`Total matches: ${matches.length}\n`);

    // Group by bracket types
    const byBracketType = {};
    matches.forEach(match => {
      if (!byBracketType[match.bracket_type]) {
        byBracketType[match.bracket_type] = [];
      }
      byBracketType[match.bracket_type].push(match);
    });

    Object.keys(byBracketType).forEach(bracketType => {
      console.log(`📋 ${bracketType.toUpperCase()}:`);
      console.log(`   Total matches: ${byBracketType[bracketType].length}`);
      
      // Group by rounds
      const byRound = {};
      byBracketType[bracketType].forEach(match => {
        if (!byRound[match.round_number]) {
          byRound[match.round_number] = [];
        }
        byRound[match.round_number].push(match);
      });

      Object.keys(byRound).sort((a,b) => a-b).forEach(round => {
        console.log(`   Round ${round}: ${byRound[round].length} matches`);
        byRound[round].forEach(match => {
          const p1 = match.player1_id ? '✅' : '❌';
          const p2 = match.player2_id ? '✅' : '❌';
          const winner = match.winner_id ? '🏆' : '❌';
          console.log(`     ${match.group_id} ${match.sabo_match_id}: P1:${p1} P2:${p2} W:${winner} Status:${match.status}`);
        });
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

inspectBracketTypes();
