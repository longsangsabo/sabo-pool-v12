const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBracketFunctionality() {
  console.log('🔍 Checking tournament bracket functionality...');
  
  // 1. Check if there are tournaments
  const { data: tournaments, error: tourError } = await supabase
    .from('tournaments')
    .select('id, name, status, tournament_type')
    .limit(3);
  
  if (tourError) {
    console.error('❌ Error fetching tournaments:', tourError);
    return;
  }
  
  if (!tournaments || tournaments.length === 0) {
    console.log('⚠️ No tournaments found');
    return;
  }
  
  console.log('✅ Found tournaments:', tournaments.length);
  console.log('📋 Sample tournament:', tournaments[0]);
  
  // 2. Check for bracket-related functions
  try {
    const { data: functions, error: funcError } = await supabase.rpc('generate_single_elimination_bracket', {
      p_tournament_id: tournaments[0].id
    });
    
    if (funcError) {
      console.log('⚠️ generate_single_elimination_bracket function issue:', funcError.message);
    } else {
      console.log('✅ Bracket generation function works');
    }
  } catch (err) {
    console.log('⚠️ Bracket function error:', err.message);
  }
  
  // 3. Check existing matches for tournament
  const { data: matches, error: matchError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournaments[0].id)
    .limit(5);
    
  if (matchError) {
    console.error('❌ Error checking matches:', matchError);
  } else {
    console.log('📊 Existing matches for tournament:', matches.length);
  }
}

checkBracketFunctionality();
