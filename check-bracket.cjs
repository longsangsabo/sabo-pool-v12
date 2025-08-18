const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTournamentBracket() {
  console.log('🔍 Checking recent tournaments...');
  
  const { data: tournaments, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('📋 Recent tournaments:');
    tournaments.forEach(t => {
      console.log(`- ${t.name} (ID: ${t.id})`);
      console.log(`  Type: ${t.tournament_type}`);
      console.log(`  Status: ${t.status}`);
      console.log(`  Bracket Generated: ${t.bracket_generated || 'undefined'}`);
      console.log('');
    });
    
    if (tournaments.length > 0) {
      const latest = tournaments[0];
      console.log('🎯 Checking matches for latest tournament:', latest.id);
      
      const { data: matches, error: matchError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', latest.id);
      
      if (matchError) {
        console.error('❌ Match check error:', matchError);
      } else {
        console.log(`📊 Found ${matches.length} matches`);
        if (matches.length === 0) {
          console.log('🚨 NO BRACKET GENERATED - This is the issue!');
          console.log('💡 Need to generate bracket for tournament');
        } else {
          console.log('✅ Bracket exists, checking display components...');
        }
      }
    }
  }
}

checkTournamentBracket();
