// =============================================
// CREATE SABO-32 TOURNAMENT WITH REAL USERS
// Use actual user IDs from auth.users table
// =============================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createRealUserSABO32() {
  console.log('🔍 Finding real users for SABO-32 tournament...');
  
  try {
    // 1. Get real users from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name')
      .not('full_name', 'is', null)
      .limit(32);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`✅ Found ${profiles.length} real users with profiles`);

    if (profiles.length < 32) {
      console.log('⚠️ Not enough real users. Creating fake profiles...');
      
      // Create additional fake profiles if needed
      const needed = 32 - profiles.length;
      const fakeProfiles = [];
      
      for (let i = 1; i <= needed; i++) {
        const fakeId = `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
        fakeProfiles.push({
          user_id: fakeId,
          full_name: `Test Player ${i}`,
          display_name: `Player${i}`,
          created_at: new Date().toISOString()
        });
      }

      // Insert fake profiles
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(fakeProfiles);

      if (insertError) {
        console.warn('Could not insert fake profiles:', insertError.message);
      } else {
        console.log(`✅ Created ${needed} fake profiles`);
        profiles.push(...fakeProfiles);
      }
    }

    // 2. Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'SABO-32 Real Users Test ' + new Date().getTime(),
        tournament_type: 'double_elimination',
        max_participants: 32,
        status: 'registration',
        entry_fee: 0,
        description: 'SABO-32 tournament with real user names'
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('❌ Error creating tournament:', tournamentError);
      return;
    }

    console.log('✅ Tournament created:', tournament.id);

    // 3. Create registrations with real user IDs
    const registrations = profiles.slice(0, 32).map((profile, index) => ({
      tournament_id: tournament.id,
      user_id: profile.user_id,
      registration_status: 'confirmed',
      payment_status: 'paid',
      registration_date: new Date().toISOString()
    }));

    const { error: regError } = await supabase
      .from('tournament_registrations')
      .insert(registrations);

    if (regError) {
      console.error('❌ Error creating registrations:', regError);
      return;
    }

    console.log('✅ 32 registrations created with real users');

    console.log('\n🎯 READY TO TEST!');
    console.log('━'.repeat(50));
    console.log(`🌐 Open: http://localhost:8001`);
    console.log(`🏆 Tournament ID: ${tournament.id}`);
    console.log(`📝 Tournament Name: ${tournament.name}`);
    console.log('🎮 Steps:');
    console.log('   1. Find the tournament in the list');
    console.log('   2. Click "Tạo SABO Bracket"');
    console.log('   3. View bracket - should show real names!');
    console.log('━'.repeat(50));

    return tournament.id;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
createRealUserSABO32();
