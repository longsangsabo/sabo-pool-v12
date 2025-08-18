const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTournamentRegistrations() {
  console.log('🔍 Checking tournament registrations...');
  
  // Get latest tournament
  const { data: tournaments, error: tError } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (tError || !tournaments[0]) {
    console.error('❌ Error getting tournament:', tError);
    return;
  }
  
  const tournament = tournaments[0];
  console.log('🎯 Latest tournament:', {
    id: tournament.id,
    name: tournament.name,
    current_participants: tournament.current_participants,
    max_participants: tournament.max_participants,
    status: tournament.status,
    tournament_type: tournament.tournament_type
  });
  
  // Check registrations
  const { data: registrations, error: rError } = await supabase
    .from('tournament_registrations')
    .select('*')
    .eq('tournament_id', tournament.id);
  
  if (rError) {
    console.error('❌ Error getting registrations:', rError);
    return;
  }
  
  console.log('📊 Registration count:', registrations.length);
  console.log('📋 Registration statuses:', registrations.map(r => r.registration_status));
  
  // Count confirmed registrations
  const confirmedCount = registrations.filter(r => r.registration_status === 'confirmed').length;
  console.log('✅ Confirmed registrations:', confirmedCount);
  
  // Check existing matches
  const { data: matches, error: mError } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournament.id);
  
  if (mError) {
    console.error('❌ Error getting matches:', mError);
  } else {
    console.log('⚔️ Existing matches:', matches.length);
  }
  
  if (confirmedCount >= 16) {
    console.log('🎉 SUFFICIENT PLAYERS! Should be able to generate bracket');
    
    if (matches.length === 0) {
      console.log('⚠️ NO BRACKET GENERATED YET - this is the issue!');
    } else {
      console.log('✅ Bracket already exists');
    }
  } else {
    console.log('⚠️ NOT ENOUGH CONFIRMED PLAYERS for SABO bracket');
  }
}

checkTournamentRegistrations();
