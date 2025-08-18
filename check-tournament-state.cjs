require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournamentState() {
  console.log('🏆 Tournament State Check');
  console.log('========================');
  
  // Check tournaments
  console.log('1️⃣ Checking tournaments...');
  const { data: tournaments, error: tourError } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (tourError) {
    console.error('❌ Tournament error:', tourError);
  } else {
    console.log(`✅ Found ${tournaments?.length || 0} tournaments`);
    if (tournaments && tournaments.length > 0) {
      tournaments.forEach((t, index) => {
        console.log(`   ${index + 1}. ${t.name} (${t.id}) - Status: ${t.status}`);
      });
    }
  }
  
  // Check matches for each tournament
  if (tournaments && tournaments.length > 0) {
    for (const tournament of tournaments) {
      console.log(`\n🎯 Checking matches for: ${tournament.name}`);
      const { data: matches, error: matchError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournament.id);
        
      if (matchError) {
        console.error(`❌ Match error for ${tournament.name}:`, matchError);
      } else {
        console.log(`   📊 Found ${matches?.length || 0} matches`);
        if (matches && matches.length > 0) {
          matches.slice(0, 5).forEach((m, index) => {
            console.log(`      ${index + 1}. Match ${m.match_number} (${m.id}) - ${m.status}`);
            console.log(`         Score: ${m.score_player1 || 0} - ${m.score_player2 || 0}`);
          });
          if (matches.length > 5) {
            console.log(`      ... and ${matches.length - 5} more matches`);
          }
        }
      }
    }
  }
  
  console.log('\n🔧 Possible solutions:');
  console.log('1. Create tournament matches if none exist');
  console.log('2. Check if UI is trying to access the wrong match ID');
  console.log('3. Verify tournament bracket generation');
}

checkTournamentState().catch(console.error);
