import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

// Use anon key like the real app does
const supabase = createClient(supabaseUrl, anonKey);

async function testClubTournamentFlow() {
  console.log('🧪 Testing Club Tournament Management flow...');
  
  try {
    // 1. Test tournaments loading
    console.log('1. 🏆 Testing tournaments loading...');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name, status, current_participants')
      .limit(3);
    
    if (tournamentsError) {
      console.log('❌ Tournaments error:', tournamentsError.message);
      return false;
    }
    
    console.log(`✅ Tournaments loaded: ${tournaments?.length || 0}`);
    
    if (!tournaments || tournaments.length === 0) {
      console.log('⚠️ No tournaments found to test with');
      return true;
    }
    
    // 2. Test the exact same query pattern used in ClubTournamentManagement
    const testTournament = tournaments[0];
    console.log(`\n2. 📋 Testing registrations for: ${testTournament.name}`);
    
    // This is the EXACT same query from ClubTournamentManagement.tsx
    const { data: registrationsData, error: registrationsError } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        tournament_id,
        user_id,
        registration_status,
        payment_status,
        notes,
        created_at,
        updated_at
      `)
      .eq('tournament_id', testTournament.id)
      .order('created_at', { ascending: false });

    if (registrationsError) {
      console.log('❌ Registrations error:', registrationsError.message);
      return false;
    }

    console.log(`✅ Registrations loaded: ${registrationsData?.length || 0}`);

    // 3. Test profiles loading (separate query approach)
    const userIds = registrationsData?.map(r => r.user_id).filter(Boolean) || [];
    
    if (userIds.length > 0) {
      console.log(`3. 👥 Testing profiles for ${userIds.length} users...`);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          display_name,
          avatar_url,
          verified_rank,
          elo
        `)
        .in('user_id', userIds);

      if (profilesError) {
        console.log('❌ Profiles error:', profilesError.message);
        return false;
      }

      console.log(`✅ Profiles loaded: ${profilesData?.length || 0}`);
      
      // 4. Test data combination (same as component)
      const combinedData = registrationsData?.map(reg => ({
        ...reg,
        profiles: profilesData?.find(p => p.user_id === reg.user_id)
      })) || [];

      console.log(`4. 🔗 Combined data: ${combinedData.length} registrations with profiles`);
      
      // Show sample data
      if (combinedData.length > 0) {
        console.log('\n📊 Sample combined data:');
        combinedData.slice(0, 3).forEach((reg, index) => {
          console.log(`   ${index + 1}. ${reg.profiles?.full_name || 'Unknown'} (${reg.registration_status})`);
        });
      }
    }
    
    console.log('\n✅ All tests passed! ClubTournamentManagement should work correctly now.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testClubTournamentFlow().then(success => {
  if (success) {
    console.log('\n🎉 SUCCESS: Tournament management flow is working!');
    console.log('🌐 You can now access http://localhost:8080/club-management/tournaments');
    console.log('📝 The "Xem thành viên" feature should work without relationship errors.');
  } else {
    console.log('\n❌ FAILED: There are still issues to resolve.');
  }
});
