require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function troubleshoot() {
  console.log('🔍 Troubleshooting data access...\n');

  try {
    // Test 1: Can we access table at all?
    const { data: allMatches, error: allError } = await supabase
      .from('sabo32_matches')
      .select('tournament_id, bracket_type, sabo_match_id')
      .limit(5);

    console.log(`📋 Can access table: ${allMatches ? 'YES' : 'NO'}`);
    if (allError) {
      console.log('   Error:', allError);
    } else if (allMatches) {
      console.log(`   Found ${allMatches.length} sample matches`);
      allMatches.forEach(m => {
        console.log(`   - ${m.sabo_match_id}: ${m.bracket_type} (tournament: ${m.tournament_id})`);
      });
    }

    // Test 2: Find all tournament IDs
    const { data: tournaments, error: tournError } = await supabase
      .from('sabo32_matches')
      .select('tournament_id')
      .limit(20);

    if (tournaments) {
      const uniqueTournaments = [...new Set(tournaments.map(t => t.tournament_id))];
      console.log(`\n📋 Found tournament IDs:`);
      uniqueTournaments.forEach(id => {
        console.log(`   - ${id}`);
      });
    }

    // Test 3: Try the suspected tournament ID
    const { data: suspectedMatches, error: suspError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', '7aba5a78-5c2b-4884-937d-99274220b019')
      .limit(3);

    console.log(`\n📋 Matches with suspected tournament ID: ${suspectedMatches?.length || 0}`);
    
    // Test 4: Try without tournament filter  
    const { data: noFilterMatches, error: nfError } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('bracket_type', 'GROUP_A_WINNERS')
      .limit(5);

    console.log(`\n📋 GROUP_A_WINNERS matches (no tournament filter): ${noFilterMatches?.length || 0}`);
    noFilterMatches?.forEach(m => {
      console.log(`   ${m.sabo_match_id}: Tournament ${m.tournament_id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

troubleshoot();
