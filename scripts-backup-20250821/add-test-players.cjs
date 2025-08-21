const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function addTestPlayersToTournament() {
  console.log('🎯 Adding 16 test players to latest tournament...');
  
  // Get latest tournament
  const { data: tournaments, error: tourError } = await supabase
    .from('tournaments')
    .select('id, name, tournament_type')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (tourError || !tournaments || tournaments.length === 0) {
    console.error('❌ No tournaments found:', tourError);
    return;
  }
  
  const tournament = tournaments[0];
  console.log('📋 Tournament:', tournament.name, tournament.tournament_type);
  
  if (tournament.tournament_type !== 'double_elimination') {
    console.log('⚠️ Tournament is not double elimination, but continuing...');
  }
  
  // Get current user (tournament creator)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ Not authenticated');
    return;
  }
  
  // Create 16 test registrations with current user
  const testRegistrations = [];
  for (let i = 1; i <= 16; i++) {
    testRegistrations.push({
      tournament_id: tournament.id,
      user_id: user.id, // Use current user for all test registrations
      registration_status: 'confirmed',
      display_name: `Test Player ${i}`,
      created_at: new Date().toISOString()
    });
  }
  
  // Insert test registrations
  const { data: regResult, error: regError } = await supabase
    .from('tournament_registrations')
    .insert(testRegistrations);
  
  if (regError) {
    console.error('❌ Error creating registrations:', regError);
    return;
  }
  
  console.log('✅ Created 16 test registrations!');
  console.log('🎯 Now you can try generating SABO bracket');
}

addTestPlayersToTournament();
