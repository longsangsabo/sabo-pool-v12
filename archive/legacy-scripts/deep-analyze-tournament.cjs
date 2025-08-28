const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function deepAnalyzeTournament() {
  console.log('🔬 DEEP ANALYSIS OF 32-PLAYER TOURNAMENT\n');
  console.log('=' .repeat(90));
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // 1. Get ALL matches with detailed info
    console.log('1. 📊 COMPLETE MATCH DATA EXTRACTION:');
    
    const { data: allMatches } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('bracket_type')
      .order('round_number')
      .order('match_number');

    console.log(`Total matches in tournament: ${allMatches?.length || 0}`);

    // 2. Organize by bracket type and round
    const bracketAnalysis = {};
    
    allMatches?.forEach(match => {
      const key = match.bracket_type;
      if (!bracketAnalysis[key]) {
        bracketAnalysis[key] = {
          total: 0,
          completed: 0,
          pending: 0,
          rounds: {}
        };
      }
      
      bracketAnalysis[key].total++;
      bracketAnalysis[key][match.status]++;
      
      if (!bracketAnalysis[key].rounds[match.round_number]) {
        bracketAnalysis[key].rounds[match.round_number] = [];
      }
      bracketAnalysis[key].rounds[match.round_number].push(match);
    });

    // 3. Detailed bracket analysis
    console.log('\n2. 🏗️ BRACKET STRUCTURE ANALYSIS:');
    
    Object.keys(bracketAnalysis).forEach(bracketType => {
      const bracket = bracketAnalysis[bracketType];
      console.log(`\n📋 ${bracketType.toUpperCase()}:`);
      console.log(`   Total: ${bracket.total} matches`);
      console.log(`   Completed: ${bracket.completed || 0}`);
      console.log(`   Pending: ${bracket.pending || 0}`);
      
      const rounds = Object.keys(bracket.rounds).sort((a, b) => parseInt(a) - parseInt(b));
      console.log(`   Rounds: ${rounds.join(', ')}`);
      
      rounds.forEach(round => {
        const roundMatches = bracket.rounds[round];
        const completed = roundMatches.filter(m => m.status === 'completed').length;
        const pending = roundMatches.filter(m => m.status === 'pending').length;
        console.log(`     Round ${round}: ${roundMatches.length} matches (${completed} completed, ${pending} pending)`);
      });
    });

    // 4. Flow analysis for each group
    console.log('\n3. 🔄 ADVANCEMENT FLOW ANALYSIS:');
    
    await analyzeGroupFlow('A', allMatches);
    await analyzeGroupFlow('B', allMatches);

    // 5. Cross-bracket analysis
    console.log('\n4. 🌉 CROSS-BRACKET FLOW ANALYSIS:');
    
    const crossMatches = allMatches?.filter(m => m.bracket_type?.includes('cross')) || [];
    console.log(`\nCross-bracket matches: ${crossMatches.length}`);
    
    crossMatches.forEach(match => {
      console.log(`   ${match.sabo_match_id}: ${match.status}`);
      if (match.status === 'completed') {
        console.log(`     Winner: ${match.winner_id}`);
      }
      if (match.player1_id || match.player2_id) {
        console.log(`     Players: ${match.player1_id || 'TBD'} vs ${match.player2_id || 'TBD'}`);
      }
    });

    // 6. Tournament progression analysis
    console.log('\n5. 📈 TOURNAMENT PROGRESSION ANALYSIS:');
    
    const progressionAnalysis = await analyzeTournamentProgression(tournamentId, allMatches);
    
    console.log('\nProgression Summary:');
    Object.keys(progressionAnalysis).forEach(stage => {
      const data = progressionAnalysis[stage];
      console.log(`   ${stage}: ${data.completed}/${data.total} (${Math.round(data.percentage)}%)`);
    });

    // 7. Player journey analysis
    console.log('\n6. 👥 PLAYER JOURNEY ANALYSIS:');
    
    await analyzePlayerJourneys(tournamentId, allMatches);

    // 8. Logic consistency check
    console.log('\n7. ✅ LOGIC CONSISTENCY CHECK:');
    
    const consistencyIssues = await checkLogicConsistency(allMatches);
    
    if (consistencyIssues.length === 0) {
      console.log('   ✅ No logic consistency issues found');
    } else {
      console.log(`   ⚠️ Found ${consistencyIssues.length} issues:`);
      consistencyIssues.forEach((issue, index) => {
        console.log(`     ${index + 1}. ${issue}`);
      });
    }

    // 9. Final tournament state
    console.log('\n8. 🏆 FINAL TOURNAMENT STATE:');
    
    const finalState = await getFinalTournamentState(tournamentId);
    console.log(`   Champion: ${finalState.champion || 'TBD'}`);
    console.log(`   Runner-up: ${finalState.runnerup || 'TBD'}`);
    console.log(`   Tournament Status: ${finalState.status}`);
    console.log(`   Completion: ${finalState.completionPercentage}%`);

    console.log('\n' + '=' .repeat(90));
    console.log('🔬 DEEP ANALYSIS COMPLETE');
    console.log('=' .repeat(90));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function analyzeGroupFlow(group, allMatches) {
  console.log(`\n🅰️ GROUP ${group} FLOW:`);
  
  const groupMatches = allMatches?.filter(m => 
    m.bracket_type?.includes(`group_${group.toLowerCase()}`)
  ) || [];
  
  console.log(`   Total matches: ${groupMatches.length}`);
  
  // Winners bracket
  const winners = groupMatches.filter(m => m.bracket_type?.includes('winners'));
  console.log(`   Winners bracket: ${winners.length} matches`);
  
  // Losers brackets
  const losersA = groupMatches.filter(m => m.bracket_type?.includes('losers_a'));
  const losersB = groupMatches.filter(m => m.bracket_type?.includes('losers_b'));
  console.log(`   Losers A: ${losersA.length} matches`);
  console.log(`   Losers B: ${losersB.length} matches`);
  
  // Group finals
  const finals = groupMatches.filter(m => m.bracket_type?.includes('final'));
  console.log(`   Group Finals: ${finals.length} matches`);
  
  // Get representatives
  const representatives = finals.filter(m => m.status === 'completed').map(m => m.winner_id);
  console.log(`   Representatives to Cross-Bracket: ${representatives.length}/2`);
}

async function analyzeTournamentProgression(tournamentId, allMatches) {
  const stages = {
    'Group Stage': allMatches?.filter(m => 
      m.bracket_type?.includes('winners') || 
      m.bracket_type?.includes('losers')
    ) || [],
    'Group Finals': allMatches?.filter(m => 
      m.bracket_type?.includes('final') && 
      !m.bracket_type?.includes('cross')
    ) || [],
    'Cross-Bracket': allMatches?.filter(m => 
      m.bracket_type?.includes('cross')
    ) || []
  };
  
  const result = {};
  Object.keys(stages).forEach(stage => {
    const matches = stages[stage];
    const completed = matches.filter(m => m.status === 'completed').length;
    result[stage] = {
      total: matches.length,
      completed,
      percentage: matches.length > 0 ? (completed / matches.length) * 100 : 0
    };
  });
  
  return result;
}

async function analyzePlayerJourneys(tournamentId, allMatches) {
  console.log('\nPlayer journey analysis:');
  
  // Get all unique players
  const allPlayers = new Set();
  allMatches?.forEach(match => {
    if (match.player1_id) allPlayers.add(match.player1_id);
    if (match.player2_id) allPlayers.add(match.player2_id);
  });
  
  console.log(`   Total unique players: ${allPlayers.size}`);
  
  // Analyze champion's journey
  const crossFinal = allMatches?.find(m => m.bracket_type === 'cross_final');
  if (crossFinal?.winner_id) {
    console.log(`   Champion: ${crossFinal.winner_id}`);
    
    // Get champion's matches
    const championMatches = allMatches?.filter(m => 
      (m.player1_id === crossFinal.winner_id || m.player2_id === crossFinal.winner_id) &&
      m.status === 'completed'
    ) || [];
    
    console.log(`   Champion's total matches: ${championMatches.length}`);
    
    const wins = championMatches.filter(m => m.winner_id === crossFinal.winner_id).length;
    const losses = championMatches.length - wins;
    console.log(`   Champion's record: ${wins}W-${losses}L`);
  }
}

async function checkLogicConsistency(allMatches) {
  const issues = [];
  
  // Check if Cross-Bracket has players without Group Finals being complete
  const groupAFinals = allMatches?.filter(m => m.bracket_type === 'group_a_final') || [];
  const groupBFinals = allMatches?.filter(m => m.bracket_type === 'group_b_final') || [];
  const crossSemis = allMatches?.filter(m => m.bracket_type === 'cross_semifinals') || [];
  
  const allGroupFinalsComplete = [...groupAFinals, ...groupBFinals].every(m => m.status === 'completed');
  const crossSemisHavePlayers = crossSemis.every(m => m.player1_id && m.player2_id);
  
  if (crossSemisHavePlayers && !allGroupFinalsComplete) {
    issues.push('Cross-Bracket Semifinals have players but Group Finals are not all completed');
  }
  
  // Check advancement consistency
  const bracketTypes = ['group_a_winners', 'group_b_winners'];
  bracketTypes.forEach(bracketType => {
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
        issues.push(`${bracketType} Round ${currentRound} has completed matches but Round ${nextRound} has no players`);
      }
    }
  });
  
  return issues;
}

async function getFinalTournamentState(tournamentId) {
  const { data: crossFinal } = await serviceSupabase
    .from('sabo32_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('bracket_type', 'cross_final')
    .single();
  
  const { data: allMatches } = await serviceSupabase
    .from('sabo32_matches')
    .select('status')
    .eq('tournament_id', tournamentId);
  
  const completed = allMatches?.filter(m => m.status === 'completed').length || 0;
  const total = allMatches?.length || 0;
  
  return {
    champion: crossFinal?.winner_id || null,
    runnerup: crossFinal?.winner_id ? 
      (crossFinal.player1_id === crossFinal.winner_id ? crossFinal.player2_id : crossFinal.player1_id) : 
      null,
    status: crossFinal?.status === 'completed' ? 'Completed' : 'In Progress',
    completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

deepAnalyzeTournament();
