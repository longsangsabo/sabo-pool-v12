// =============================================
// TEST SABO-32 WITH NEW sabo32_matches TABLE
// Create tournament with 32 players and test button
// =============================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSABO32TestTournament() {
  console.log('🏆 Creating SABO-32 Test Tournament...');
  
  try {
    // 1. Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'SABO-32 Test Tournament ' + new Date().getTime(),
        tournament_type: 'double_elimination',
        max_participants: 32,
        status: 'registration',
        entry_fee: 0,
        description: 'Test tournament for 32-player SABO double elimination'
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('❌ Error creating tournament:', tournamentError);
      return;
    }

    console.log('✅ Tournament created:', tournament.id);

    // 2. Create 32 fake user registrations
    const registrations = [];
    for (let i = 1; i <= 32; i++) {
      registrations.push({
        tournament_id: tournament.id,
        user_id: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`, // fake UUID
        registration_status: 'confirmed',
        payment_status: 'paid',
        registration_date: new Date().toISOString()
      });
    }

    const { error: regError } = await supabase
      .from('tournament_registrations')
      .insert(registrations);

    if (regError) {
      console.error('❌ Error creating registrations:', regError);
      return;
    }

    console.log('✅ 32 registrations created');

    // 3. Verify sabo32_matches table is empty for this tournament
    const { data: existingMatches } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournament.id);

    console.log(`📊 Current matches in sabo32_matches: ${existingMatches?.length || 0}`);

    console.log('\n🎯 TEST READY!');
    console.log('━'.repeat(50));
    console.log(`🌐 Open: http://localhost:8001`);
    console.log(`🏆 Tournament ID: ${tournament.id}`);
    console.log(`📝 Tournament Name: ${tournament.name}`);
    console.log('🎮 Steps to test:');
    console.log('   1. Go to tournaments page');
    console.log('   2. Find the test tournament');
    console.log('   3. Click "Tạo SABO Bracket" button');
    console.log('   4. Should create 53 matches in sabo32_matches table');
    console.log('━'.repeat(50));

    return tournament.id;
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  }
}

// Run the test
createSABO32TestTournament();
