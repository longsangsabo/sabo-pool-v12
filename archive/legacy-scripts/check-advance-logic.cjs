require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdvanceLogic() {
  console.log('🔍 Checking advance logic comprehensively...\n');

  try {
    // 1. Check if functions exist
    console.log('📋 1. Checking stored functions:');
    const { data: functions, error: funcError } = await supabase
      .rpc('check_function_exists', { function_name: 'advance_tournament' });
    
    if (funcError) {
      console.log('❌ Error checking functions:', funcError.message);
    } else {
      console.log('✅ Functions check completed');
    }

    // 2. Check if triggers exist
    console.log('\n📋 2. Checking triggers:');
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('event_object_table', 'sabo32_matches');

    if (triggerError) {
      console.log('❌ Error checking triggers:', triggerError.message);
    } else {
      console.log('✅ Found', triggers?.length || 0, 'triggers on sabo32_matches table');
      triggers?.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation}`);
      });
    }

    // 3. Check database schema for any advance-related functions
    console.log('\n📋 3. Checking database schema for advance functions:');
    const { data: schemaFunctions, error: schemaError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .like('routine_name', '%advance%')
      .eq('routine_schema', 'public');

    if (schemaError) {
      console.log('❌ Error checking schema functions:', schemaError.message);
    } else {
      console.log('✅ Found', schemaFunctions?.length || 0, 'advance-related functions');
      schemaFunctions?.forEach(func => {
        console.log(`   - ${func.routine_name} (${func.routine_type})`);
      });
    }

    // 4. Check for any tournament-related functions
    console.log('\n📋 4. Checking all tournament-related functions:');
    const { data: tournamentFunctions, error: tournamentError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .or('routine_name.like.%tournament%,routine_name.like.%sabo%,routine_name.like.%bracket%')
      .eq('routine_schema', 'public');

    if (tournamentError) {
      console.log('❌ Error checking tournament functions:', tournamentError.message);
    } else {
      console.log('✅ Found', tournamentFunctions?.length || 0, 'tournament-related functions');
      tournamentFunctions?.forEach(func => {
        console.log(`   - ${func.routine_name} (${func.routine_type})`);
      });
    }

    // 5. Test manual advance logic for current tournament
    console.log('\n📋 5. Testing manual advance logic:');
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';

    // Check current completed matches that should trigger advances
    const { data: completedMatches, error: matchError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'completed')
      .in('bracket_type', ['winners_round_1', 'winners_round_2', 'winners_round_3'])
      .order('bracket_type', { ascending: true });

    if (matchError) {
      console.log('❌ Error getting completed matches:', matchError.message);
      return;
    }

    console.log(`✅ Found ${completedMatches.length} completed Winners matches`);

    // Group by round
    const rounds = {};
    completedMatches.forEach(match => {
      if (!rounds[match.bracket_type]) rounds[match.bracket_type] = [];
      rounds[match.bracket_type].push(match);
    });

    // Check what should be advanced
    for (const [roundType, matches] of Object.entries(rounds)) {
      console.log(`\n   📊 ${roundType.toUpperCase()}:`);
      console.log(`      - Completed matches: ${matches.length}`);
      
      // Get losers from these matches
      const losers = matches.map(match => {
        if (match.player1_score > match.player2_score) {
          return { player_id: match.player2_id, match_id: match.id, group: match.group_name };
        } else {
          return { player_id: match.player1_id, match_id: match.id, group: match.group_name };
        }
      }).filter(loser => loser.player_id);

      console.log(`      - Losers to advance: ${losers.length}`);
      losers.forEach(loser => {
        console.log(`        * Player ${loser.player_id} from Group ${loser.group}`);
      });

      // Check where these losers should go
      if (roundType === 'winners_round_1') {
        console.log(`      - Should go to: losers_round_1`);
      } else if (roundType === 'winners_round_2') {
        console.log(`      - Should go to: losers_branch_b`);
      }
    }

    // 6. Check current Losers Branch B state
    console.log('\n📋 6. Current Losers Branch B state:');
    const { data: losersBranchB, error: losersBError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('bracket_type', 'losers_branch_b')
      .order('match_number');

    if (losersBError) {
      console.log('❌ Error getting Losers Branch B:', losersBError.message);
    } else {
      console.log(`✅ Found ${losersBranchB.length} Losers Branch B matches`);
      losersBranchB.forEach(match => {
        const p1Status = match.player1_id ? '✅' : '❌';
        const p2Status = match.player2_id ? '✅' : '❌';
        console.log(`   - ${match.match_number}: ${p1Status} P1 vs ${p2Status} P2 (Group ${match.group_name})`);
      });
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

checkAdvanceLogic();
