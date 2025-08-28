const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkAutoAdvancementLogic() {
  console.log('🔍 CHECKING AUTO-ADVANCEMENT LOGIC FOR SABO32\n');
  console.log('=' .repeat(80));
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Check current advancement functions in database
    console.log('\n1. 📊 CHECKING DATABASE ADVANCEMENT FUNCTIONS:');
    
    const { data: functions, error: funcError } = await serviceSupabase
      .from('pg_proc')
      .select('proname')
      .like('proname', '%advance%');
    
    console.log('Available advancement functions:');
    functions?.forEach(func => {
      console.log(`   - ${func.proname}`);
    });

    // 2. Check current tournament state
    console.log('\n2. 🎯 CURRENT TOURNAMENT STATE:');
    
    const { data: allMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number')
      .order('match_number');

    const matchesByStatus = {};
    const matchesByBracket = {};
    
    allMatches?.forEach(match => {
      // By status
      if (!matchesByStatus[match.status]) matchesByStatus[match.status] = [];
      matchesByStatus[match.status].push(match);
      
      // By bracket
      if (!matchesByBracket[match.bracket_type]) matchesByBracket[match.bracket_type] = [];
      matchesByBracket[match.bracket_type].push(match);
    });

    console.log('\nMatches by Status:');
    Object.keys(matchesByStatus).forEach(status => {
      console.log(`   ${status}: ${matchesByStatus[status].length} matches`);
    });

    console.log('\nMatches by Bracket Type:');
    Object.keys(matchesByBracket).forEach(bracket => {
      const matches = matchesByBracket[bracket];
      const completed = matches.filter(m => m.status === 'completed').length;
      const pending = matches.filter(m => m.status === 'pending').length;
      console.log(`   ${bracket}: ${completed}/${matches.length} completed, ${pending} pending`);
    });

    // 3. Identify advancement issues
    console.log('\n3. 🔧 IDENTIFYING ADVANCEMENT ISSUES:');
    
    // Check for completed matches without proper advancement
    const completedMatches = allMatches?.filter(m => m.status === 'completed' && m.winner_id) || [];
    
    console.log(`\nCompleted matches with winners: ${completedMatches.length}`);
    
    // Analyze each bracket type for advancement issues
    const bracketTypes = ['group_a_winners', 'group_b_winners', 'group_a_losers_a', 'group_b_losers_a'];
    
    for (const bracketType of bracketTypes) {
      console.log(`\n🔍 Analyzing ${bracketType}:`);
      
      const bracketMatches = allMatches?.filter(m => m.bracket_type === bracketType) || [];
      const byRound = {};
      
      bracketMatches.forEach(match => {
        if (!byRound[match.round_number]) byRound[match.round_number] = [];
        byRound[match.round_number].push(match);
      });
      
      const rounds = Object.keys(byRound).sort((a, b) => parseInt(a) - parseInt(b));
      
      for (const round of rounds) {
        const roundMatches = byRound[round];
        const completed = roundMatches.filter(m => m.status === 'completed').length;
        const pending = roundMatches.filter(m => m.status === 'pending').length;
        console.log(`   Round ${round}: ${completed}/${roundMatches.length} completed, ${pending} pending`);
        
        // Check if winners advanced properly
        if (completed > 0 && parseInt(round) < Math.max(...rounds.map(r => parseInt(r)))) {
          const nextRound = parseInt(round) + 1;
          const nextRoundMatches = byRound[nextRound] || [];
          
          // Count how many next round matches have players assigned
          const nextRoundWithPlayers = nextRoundMatches.filter(m => m.player1_id || m.player2_id).length;
          console.log(`     → Should advance to Round ${nextRound}: ${nextRoundWithPlayers}/${nextRoundMatches.length} have players`);
        }
      }
    }

    // 4. Check Cross-Bracket advancement logic
    console.log('\n4. 🌉 CROSS-BRACKET ADVANCEMENT LOGIC:');
    
    const groupAFinals = allMatches?.filter(m => m.bracket_type === 'group_a_final') || [];
    const groupBFinals = allMatches?.filter(m => m.bracket_type === 'group_b_final') || [];
    const crossSemis = allMatches?.filter(m => m.bracket_type === 'cross_semifinals') || [];
    const crossFinal = allMatches?.filter(m => m.bracket_type === 'cross_final') || [];

    console.log('Cross-Bracket Flow:');
    console.log(`   Group A Finals: ${groupAFinals.filter(m => m.status === 'completed').length}/${groupAFinals.length} completed`);
    console.log(`   Group B Finals: ${groupBFinals.filter(m => m.status === 'completed').length}/${groupBFinals.length} completed`);
    console.log(`   Cross Semifinals: ${crossSemis.filter(m => m.status === 'completed').length}/${crossSemis.length} completed`);
    console.log(`   Cross Final: ${crossFinal.filter(m => m.status === 'completed').length}/${crossFinal.length} completed`);

    // 5. Detect specific advancement problems
    console.log('\n5. 🚨 ADVANCEMENT PROBLEMS DETECTED:');
    
    const problems = [];
    
    // Problem 1: Check if Group Finals have winners but Cross-Semifinals don't have correct players
    const allGroupFinalsCompleted = [...groupAFinals, ...groupBFinals].every(m => m.status === 'completed');
    const crossSemisHaveCorrectPlayers = crossSemis.every(m => m.player1_id && m.player2_id);
    
    if (allGroupFinalsCompleted && !crossSemisHaveCorrectPlayers) {
      problems.push('Cross-Semifinals missing players despite Group Finals being completed');
    }

    // Problem 2: Check Winners/Losers bracket progression
    for (const bracketType of ['group_a_winners', 'group_b_winners']) {
      const bracket = allMatches?.filter(m => m.bracket_type === bracketType) || [];
      const byRound = {};
      
      bracket.forEach(match => {
        if (!byRound[match.round_number]) byRound[match.round_number] = [];
        byRound[match.round_number].push(match);
      });
      
      const rounds = Object.keys(byRound).sort((a, b) => parseInt(a) - parseInt(b));
      
      for (let i = 0; i < rounds.length - 1; i++) {
        const currentRound = rounds[i];
        const nextRound = rounds[i + 1];
        
        const currentCompleted = byRound[currentRound].filter(m => m.status === 'completed').length;
        const nextWithPlayers = byRound[nextRound].filter(m => m.player1_id || m.player2_id).length;
        
        if (currentCompleted > 0 && nextWithPlayers === 0) {
          problems.push(`${bracketType} Round ${currentRound} completed but Round ${nextRound} has no players`);
        }
      }
    }

    console.log(`Found ${problems.length} advancement problems:`);
    problems.forEach((problem, index) => {
      console.log(`   ${index + 1}. ${problem}`);
    });

    // 6. Recommended fixes
    console.log('\n6. 💡 RECOMMENDED FIXES:');
    console.log('   1. Create comprehensive auto-advancement function for SABO32');
    console.log('   2. Fix Winners Bracket progression (Round 1→2→3→Final)');
    console.log('   3. Fix Losers Bracket progression (A & B branches)');
    console.log('   4. Fix Group Finals → Cross-Bracket advancement');
    console.log('   5. Add trigger for automatic advancement on match completion');

    return { problems, allMatches, matchesByBracket };

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAutoAdvancementLogic();
