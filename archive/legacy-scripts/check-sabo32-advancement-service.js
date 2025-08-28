// =============================================
// CHECK SABO-32 ADVANCEMENT WITH SERVICE KEY
// Analyze tournament bracket and advancement logic
// =============================================

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

// Create supabase client with service key
const supabase = createClient(supabaseUrl, serviceKey);

const TOURNAMENT_ID = 'sabo-32-2024';

async function checkSABO32Advancement() {
  console.log('🔍 Checking SABO-32 Tournament Advancement...');
  console.log('');

  try {
    // 1. First, find all tournaments
    const { data: tournaments, error: tourError } = await supabase
      .from('sabo32_matches')
      .select('tournament_id')
      .limit(10);

    if (tourError) throw tourError;

    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No SABO-32 tournaments found');
      return;
    }

    // Get unique tournament IDs
    const uniqueTournaments = [...new Set(tournaments.map(t => t.tournament_id))];
    console.log('🎯 Found tournaments:', uniqueTournaments);
    console.log('');

    // Use the first tournament found
    const tournamentId = uniqueTournaments[0];
    console.log('📊 Analyzing tournament:', tournamentId);
    console.log('');

    // 2. Get all matches for this tournament
    const { data: matches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('group_id')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');

    if (error) throw error;

    if (!matches || matches.length === 0) {
      console.log('❌ No matches found for tournament:', tournamentId);
      return;
    }

    console.log(`📊 Total matches: ${matches.length}`);
    console.log('');

    // 2. Analyze by groups
    const groupA = matches.filter(m => m.group_id === 'A');
    const groupB = matches.filter(m => m.group_id === 'B');
    const crossBracket = matches.filter(m => m.group_id === null);

    console.log('🏆 GROUP A ANALYSIS:');
    analyzeGroup(groupA, 'A');
    console.log('');

    console.log('🏆 GROUP B ANALYSIS:');
    analyzeGroup(groupB, 'B');
    console.log('');

    console.log('🎯 CROSS-BRACKET ANALYSIS:');
    analyzeCrossBracket(crossBracket);
    console.log('');

    // 3. Check advancement issues
    console.log('🔧 ADVANCEMENT ISSUES:');
    checkAdvancementIssues(matches);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function analyzeGroup(matches, groupId) {
  const winners = matches.filter(m => m.bracket_type === `group_${groupId.toLowerCase()}_winners`);
  const losersA = matches.filter(m => m.bracket_type === `group_${groupId.toLowerCase()}_losers_a`);
  const losersB = matches.filter(m => m.bracket_type === `group_${groupId.toLowerCase()}_losers_b`);
  const finals = matches.filter(m => m.bracket_type === `group_${groupId.toLowerCase()}_final`);

  console.log(`  Winners Bracket: ${winners.length} matches`);
  console.log(`    - Completed: ${winners.filter(m => m.status === 'completed').length}`);
  console.log(`    - Pending: ${winners.filter(m => m.status === 'pending').length}`);

  console.log(`  Losers Branch A: ${losersA.length} matches`);
  console.log(`    - Completed: ${losersA.filter(m => m.status === 'completed').length}`);
  console.log(`    - Pending: ${losersA.filter(m => m.status === 'pending').length}`);
  console.log(`    - With players: ${losersA.filter(m => m.player1_id && m.player2_id).length}`);

  console.log(`  Losers Branch B: ${losersB.length} matches`);
  console.log(`    - Completed: ${losersB.filter(m => m.status === 'completed').length}`);
  console.log(`    - Pending: ${losersB.filter(m => m.status === 'pending').length}`);
  console.log(`    - With players: ${losersB.filter(m => m.player1_id && m.player2_id).length}`);

  console.log(`  Group Final: ${finals.length} matches`);
  console.log(`    - Completed: ${finals.filter(m => m.status === 'completed').length}`);

  // Check specific loser branch B matches
  console.log(`  📋 Losers B Details:`);
  losersB.forEach(match => {
    console.log(`    Round ${match.round_number}, Match ${match.match_number}: ${match.player1_id ? 'Player1' : 'TBD'} vs ${match.player2_id ? 'Player2' : 'TBD'} - ${match.status}`);
  });
}

function analyzeCrossBracket(matches) {
  const semifinals = matches.filter(m => m.bracket_type === 'cross_semifinals');
  const finals = matches.filter(m => m.bracket_type === 'cross_final');

  console.log(`  Semifinals: ${semifinals.length} matches`);
  console.log(`    - Completed: ${semifinals.filter(m => m.status === 'completed').length}`);
  console.log(`    - With players: ${semifinals.filter(m => m.player1_id && m.player2_id).length}`);

  console.log(`  Finals: ${finals.length} matches`);
  console.log(`    - Completed: ${finals.filter(m => m.status === 'completed').length}`);
  console.log(`    - With players: ${finals.filter(m => m.player1_id && m.player2_id).length}`);
}

function checkAdvancementIssues(matches) {
  // Find matches that should have players but don't
  const issueMatches = matches.filter(m => 
    m.status === 'pending' && 
    (!m.player1_id || !m.player2_id) &&
    m.bracket_type.includes('losers')
  );

  if (issueMatches.length > 0) {
    console.log(`  ❌ Found ${issueMatches.length} matches missing players:`);
    issueMatches.forEach(match => {
      console.log(`    - ${match.bracket_type} Round ${match.round_number}, Match ${match.match_number}`);
    });
  } else {
    console.log(`  ✅ No obvious advancement issues found`);
  }

  // Check for completed winners matches that should advance players
  const completedWinners = matches.filter(m => 
    m.status === 'completed' && 
    m.bracket_type.includes('winners')
  );

  console.log(`  📈 ${completedWinners.length} completed winners matches should have advanced losers`);
}

// Run the analysis
checkSABO32Advancement();
