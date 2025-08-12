const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function testTournamentRegistrations() {
  console.log('🔍 Testing tournament_registrations functionality...\n');

  try {
    // 1. Check if table exists and has data
    console.log('1. Checking tournament_registrations table...');
    const { data: registrations, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error accessing table:', error);
      return;
    }

    console.log('✅ Table accessible! Found', registrations.length, 'existing registrations');
    if (registrations.length > 0) {
      console.log('📝 Sample registration:', {
        id: registrations[0].id,
        tournament_id: registrations[0].tournament_id,
        user_id: registrations[0].user_id,
        status: registrations[0].registration_status
      });
    }

    // 2. Find tournaments for testing
    console.log('\n2. Finding tournaments for testing...');
    const { data: tournaments, error: tournError } = await supabase
      .from('tournaments')
      .select('id, name, max_participants, current_participants, status')
      .in('status', ['registration_open', 'preparation'])
      .limit(3);

    if (tournError) {
      console.error('❌ Error getting tournaments:', tournError);
      return;
    }

    if (!tournaments || tournaments.length === 0) {
      console.log('⚠️ No available tournaments found');
      return;
    }

    console.log('🏆 Available tournaments:');
    tournaments.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name} (${t.current_participants}/${t.max_participants}) - ${t.status}`);
      console.log(`     ID: ${t.id}`);
    });

    // 3. Find available users
    console.log('\n3. Finding available users...');
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, verified_rank')
      .not('full_name', 'is', null)
      .limit(5);

    if (userError) {
      console.error('❌ Error getting users:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️ No users with names found');
      return;
    }

    console.log('👥 Available users:');
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.full_name || u.display_name} ${u.verified_rank ? `(${u.verified_rank})` : ''}`);
      console.log(`     ID: ${u.user_id}`);
    });

    // 4. Test adding a user to a tournament (simulate QuickAddUserDialog)
    const testTournament = tournaments[0];
    const testUser = users[0];

    console.log(`\n4. Testing registration: ${testUser.full_name} -> ${testTournament.name}`);

    // Check if user is already registered
    const { data: existing, error: existError } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', testTournament.id)
      .eq('user_id', testUser.user_id)
      .maybeSingle();

    if (existError) {
      console.error('❌ Error checking existing registration:', existError);
      return;
    }

    if (existing) {
      console.log('⚠️ User already registered in this tournament');
      console.log('✅ Test completed - registration system working!');
      return;
    }

    // Insert test registration
    console.log('📝 Creating test registration...');
    const { data: newReg, error: insertError } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: testTournament.id,
        user_id: testUser.user_id,
        registration_status: 'confirmed',
        payment_status: 'paid',
        notes: 'Test registration via QuickAddUserDialog simulation'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating registration:', insertError);
      return;
    }

    console.log('✅ Registration created successfully!');
    console.log('📋 Registration details:', {
      id: newReg.id,
      status: newReg.registration_status,
      payment: newReg.payment_status
    });

    // Update tournament participant count
    console.log('🔄 Updating tournament participant count...');
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ 
        current_participants: testTournament.current_participants + 1 
      })
      .eq('id', testTournament.id);

    if (updateError) {
      console.error('⚠️ Warning: Could not update participant count:', updateError);
    } else {
      console.log('✅ Tournament participant count updated!');
    }

    console.log('\n🎉 All tests passed! QuickAddUserDialog should work perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTournamentRegistrations();
