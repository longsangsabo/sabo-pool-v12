// =============================================
// CREATE 32-PLAYER TOURNAMENT FOR SABO TESTING
// Simple script to create tournament and test button
// =============================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSABO32TestTournament() {
  console.log('🎯 Creating SABO-32 test tournament...');
  
  try {
    // 1. Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'Test SABO-32 Double Elimination',
        tournament_type: 'double_elimination',
        max_participants: 32,
        status: 'registration',
        description: 'Test tournament for 32-player SABO system'
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('❌ Error creating tournament:', tournamentError);
      return;
    }

    console.log('✅ Tournament created:', tournament.id);
    console.log('📝 Tournament name:', tournament.name);

    // 2. Create 32 fake registrations
    const registrations = [];
    for (let i = 1; i <= 32; i++) {
      registrations.push({
        tournament_id: tournament.id,
        user_id: `test-player-${i.toString().padStart(2, '0')}`,
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

    // 3. Update tournament status to active
    await supabase
      .from('tournaments')
      .update({ status: 'active' })
      .eq('id', tournament.id);

    console.log('✅ Tournament activated');

    console.log('\n' + '='.repeat(60));
    console.log('🎯 SABO-32 TEST TOURNAMENT READY!');
    console.log('='.repeat(60));
    console.log(`Tournament ID: ${tournament.id}`);
    console.log(`Tournament Name: ${tournament.name}`);
    console.log(`Players: 32 confirmed`);
    console.log(`Type: double_elimination`);
    console.log('\n📱 NEXT STEPS:');
    console.log('1. Go to http://localhost:8080');
    console.log('2. Find tournament: "Test SABO-32 Double Elimination"');
    console.log('3. Click "Tạo SABO Bracket" button');
    console.log('4. Should create 53 matches (25 + 25 + 3)');
    console.log('5. Check for success message: "🎯 Tạo bảng đấu SABO-32 thành công!"');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSABO32TestTournament();
