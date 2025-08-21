const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vtrrfpttqhqcjkqzqgei.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnJmcHR0cWhxY2prcXpxZ2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0OTY1NDksImV4cCI6MjA0NzA3MjU0OX0.IUJGrmZGZSqTJEdhOLtb1KdgGW7-m7_FGYIRm-8rIzY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestTournament32() {
  console.log('🏆 Creating test tournament for 32 players...');
  
  try {
    // 1. Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'Test SABO-32 Tournament ' + new Date().toISOString().slice(0, 16),
        tournament_type: 'double_elimination',
        max_participants: 32,
        status: 'registration',
        description: 'Test tournament for SABO-32 double elimination system'
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('❌ Tournament creation failed:', tournamentError);
      return;
    }

    console.log('✅ Tournament created:', tournament.name);
    console.log('📄 Tournament ID:', tournament.id);

    // 2. Create 32 fake registrations
    const registrations = [];
    for (let i = 1; i <= 32; i++) {
      registrations.push({
        tournament_id: tournament.id,
        user_id: `demo-player-${i.toString().padStart(2, '0')}`,
        registration_status: 'confirmed',
        payment_status: 'paid',
        created_at: new Date().toISOString()
      });
    }

    const { error: regError } = await supabase
      .from('tournament_registrations')
      .insert(registrations);

    if (regError) {
      console.error('❌ Registration creation failed:', regError);
      return;
    }

    console.log('✅ 32 registrations created');

    // 3. Create fake profiles for players
    const profiles = [];
    for (let i = 1; i <= 32; i++) {
      profiles.push({
        user_id: `demo-player-${i.toString().padStart(2, '0')}`,
        full_name: `Player ${i}`,
        display_name: `P${i}`,
        elo: 1000 + Math.floor(Math.random() * 500),
        verified_rank: 'Demo'
      });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profiles, { onConflict: 'user_id' });

    if (profileError) {
      console.warn('⚠️ Profile creation warning:', profileError);
    } else {
      console.log('✅ 32 profiles created/updated');
    }

    console.log('');
    console.log('🎯 TEST TOURNAMENT READY!');
    console.log('📱 Steps to test:');
    console.log('1. Go to http://localhost:8000');
    console.log('2. Find tournament:', tournament.name);
    console.log('3. Click "Tạo SABO Bracket" button');
    console.log('4. Should create 53 matches for 32 players');
    console.log('5. Check if dual-group structure is created');
    console.log('');
    console.log('🔍 Tournament ID:', tournament.id);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestTournament32();
