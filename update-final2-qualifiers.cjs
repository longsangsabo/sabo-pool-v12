const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function updateFinal2Qualifiers() {
  console.log('🔧 UPDATING GROUP FINAL 2 QUALIFIERS\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    const { data, error } = await serviceSupabase
      .from('sabo32_matches')
      .update({ qualifies_as: 'group_winner_2' })
      .eq('tournament_id', tournamentId)
      .in('bracket_type', ['GROUP_A_FINAL', 'GROUP_B_FINAL'])
      .eq('match_number', 2);
    
    if (error) {
      console.error('❌ Update failed:', error);
      return;
    }
    
    console.log('✅ Updated Group Final 2 qualifiers to group_winner_2');
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
  }
}

updateFinal2Qualifiers().catch(console.error);
