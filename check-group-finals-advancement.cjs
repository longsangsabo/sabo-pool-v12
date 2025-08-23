// Check Group Finals advancement logic
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkGroupFinalsAdvancement() {
  const tournamentId = '628efd1f-96e1-4944-a5d0-27e09310d86d';
  
  console.log('=== CHECKING GROUP FINALS ADVANCEMENT ===');
  
  try {
    // 1. Check all matches in the tournament by bracket type
    const { data: allMatches, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('bracket_type')
      .order('sabo_match_id');

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    // Group matches by bracket type
    const bracketTypes = {};
    allMatches?.forEach(match => {
      if (!bracketTypes[match.bracket_type]) {
        bracketTypes[match.bracket_type] = [];
      }
      bracketTypes[match.bracket_type].push(match);
    });

    console.log('\n=== BRACKET ANALYSIS ===');
    Object.keys(bracketTypes).forEach(bracketType => {
      const matches = bracketTypes[bracketType];
      const completed = matches.filter(m => m.status === 'completed').length;
      console.log(`\n${bracketType}: ${matches.length} matches (${completed} completed)`);
      
      matches.forEach(match => {
        const status = match.status === 'completed' ? `Winner: ${match.winner_id}` : 'Pending';
        const players = `P1: ${match.player1_id ? 'Set' : 'TBD'}, P2: ${match.player2_id ? 'Set' : 'TBD'}`;
        console.log(`  - ${match.sabo_match_id}: ${players} | ${status}`);
      });
    });

    // 2. Focus on Group Finals specifically
    console.log('\n=== GROUP FINALS DETAIL ===');
    const groupAFinals = bracketTypes['GROUP_A_FINAL'] || [];
    const groupBFinals = bracketTypes['GROUP_B_FINAL'] || [];

    console.log(`Group A Finals (${groupAFinals.length} matches):`);
    groupAFinals.forEach(match => {
      console.log(`  - ${match.sabo_match_id}: P1=${match.player1_id || 'TBD'}, P2=${match.player2_id || 'TBD'}`);
    });

    console.log(`Group B Finals (${groupBFinals.length} matches):`);
    groupBFinals.forEach(match => {
      console.log(`  - ${match.sabo_match_id}: P1=${match.player1_id || 'TBD'}, P2=${match.player2_id || 'TBD'}`);
    });

    // 3. Check if we need to advance players TO Group Finals
    console.log('\n=== ADVANCEMENT TO GROUP FINALS NEEDED ===');
    
    // Check Group A Winners bracket - should advance to A-FINAL1
    const groupAWinners = bracketTypes['GROUP_A_WINNERS'] || [];
    const groupALosersA = bracketTypes['GROUP_A_LOSERS_A'] || [];
    const groupALosersB = bracketTypes['GROUP_A_LOSERS_B'] || [];

    console.log('\nGroup A advancement candidates:');
    console.log('Winners bracket completed matches:');
    groupAWinners.filter(m => m.status === 'completed').forEach(match => {
      console.log(`  - ${match.sabo_match_id}: Winner ${match.winner_id} should advance`);
    });

    console.log('Losers A bracket completed matches:');
    groupALosersA.filter(m => m.status === 'completed').forEach(match => {
      console.log(`  - ${match.sabo_match_id}: Winner ${match.winner_id} should advance`);
    });

    console.log('Losers B bracket completed matches:');
    groupALosersB.filter(m => m.status === 'completed').forEach(match => {
      console.log(`  - ${match.sabo_match_id}: Winner ${match.winner_id} should advance`);
    });

    // 4. Check tournament structure for advancement rules
    console.log('\n=== CHECKING ADVANCEMENT RULES ===');
    
    // Look for completed matches that should feed into Group Finals
    const completedMatches = allMatches?.filter(m => m.status === 'completed' && m.winner_id) || [];
    console.log(`Found ${completedMatches.length} completed matches with winners`);

    // Check which ones need to advance to Group Finals
    const needsAdvancement = [];
    completedMatches.forEach(match => {
      // Winners of final matches in each bracket should advance to Group Finals
      if (match.bracket_type.includes('WINNERS') || 
          match.bracket_type.includes('LOSERS_A') || 
          match.bracket_type.includes('LOSERS_B')) {
        
        // Check if this is a final round in the bracket
        const bracketMatches = bracketTypes[match.bracket_type] || [];
        const isLastInBracket = bracketMatches.every(m => 
          m.round_number <= match.round_number || m.status === 'completed'
        );
        
        if (isLastInBracket) {
          needsAdvancement.push({
            match: match.sabo_match_id,
            winner: match.winner_id,
            bracket: match.bracket_type,
            shouldAdvanceTo: match.bracket_type.includes('GROUP_A') ? 'GROUP_A_FINAL' : 'GROUP_B_FINAL'
          });
        }
      }
    });

    console.log('\nMatches that need advancement to Group Finals:');
    needsAdvancement.forEach(item => {
      console.log(`  - ${item.match} winner (${item.winner}) should advance to ${item.shouldAdvanceTo}`);
    });

  } catch (error) {
    console.error('Overall error:', error);
  }
}

checkGroupFinalsAdvancement();
