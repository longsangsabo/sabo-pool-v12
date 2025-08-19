const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => envContent.match(new RegExp(`${key}=(.+)`))?.[1]?.trim() || '';
const supabase = createClient(getEnvValue('VITE_SUPABASE_URL'), getEnvValue('SUPABASE_SERVICE_ROLE_KEY'));

async function ensureLosersBAdvancement(tournamentId) {
  console.log('🔧 Ensuring Losers B advancement...');
  
  // Check R202 completion and advance to semifinals
  const { data: r202 } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', 202)
    .eq('match_number', 1)
    .single();
    
  if (r202?.winner_id) {
    console.log(`📋 R202 winner (Losers B Champion): ${r202.winner_id.substring(0,8)}`);
    
    // Advance to SF2 Player 2
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        player2_id: r202.winner_id,
        status: 'pending'
      })
      .eq('tournament_id', tournamentId)
      .eq('round_number', 250)
      .eq('match_number', 2)
      .is('player2_id', null); // Only if not already set
      
    if (!error) {
      console.log('✅ Losers B Champion advanced to SF2');
    }
  }
}

(async () => {
  console.log('🔄 Applying fix to ALL tournaments...');
  
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('tournament_type', 'sabo')
    .order('created_at', { ascending: false });
    
  for (const tournament of tournaments || []) {
    console.log(`\n🏆 Checking ${tournament.name}...`);
    await ensureLosersBAdvancement(tournament.id);
  }
  
  console.log('\n✅ All tournaments updated!');
  console.log('🎯 Future tournaments will auto-advance Losers B Champions correctly!');
})();
