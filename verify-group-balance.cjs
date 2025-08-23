const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFix() {
  console.log('🔍 Verifying Group B Final fix...\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // Check all final matches
    const { data: allFinals } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .in('bracket_type', ['group_a_final', 'group_b_final'])
      .order('group_id')
      .order('match_number');

    console.log('📊 All Final Matches:');
    const groupA = allFinals.filter(m => m.group_id === 'A');
    const groupB = allFinals.filter(m => m.group_id === 'B');
    
    console.log(`\n🅰️ Group A Finals: ${groupA.length} matches`);
    groupA.forEach(match => {
      console.log(`  ${match.sabo_match_id} - Match #${match.match_number}`);
    });
    
    console.log(`\n🅱️ Group B Finals: ${groupB.length} matches`);
    groupB.forEach(match => {
      console.log(`  ${match.sabo_match_id} - Match #${match.match_number}`);
    });
    
    console.log(`\n✅ Balance: Group A (${groupA.length}) vs Group B (${groupB.length})`);
    
    if (groupA.length === groupB.length) {
      console.log('🎉 PERFECT! Groups are now balanced!');
    } else {
      console.log('⚠️ Groups still unbalanced');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyFix();
