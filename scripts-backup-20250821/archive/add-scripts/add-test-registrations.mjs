import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function addTestRegistrations() {
  console.log('👥 Adding test registrations...');
  
  const tournamentId = '9833f689-ea2b-44a3-8184-323f9f7bb29a';
  
  // Get current user from auth (tournament creator)
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('⚠️ No authenticated user - creating dummy registrations');
    
    // Create dummy registrations with fake user IDs
    const dummyUsers = Array.from({ length: 16 }, (_, i) => ({
      user_id: `dummy-user-${i+1}`,
      full_name: `Player ${i+1}`
    }));
    
    let successCount = 0;
    for (const dummy of dummyUsers) {
      const { error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournamentId,
          user_id: dummy.user_id,
          registration_status: 'confirmed',
          registration_date: new Date().toISOString()
        });
        
      if (!error) {
        successCount++;
        console.log(`✅ ${successCount}/16: ${dummy.full_name}`);
      } else if (!error.message.includes('duplicate')) {
        console.log(`❌ Failed: ${dummy.full_name}`, error.message);
      }
    }
    
    console.log(`\n🎯 Successfully registered ${successCount}/16 players`);
  } else {
    console.log('✅ Authenticated user found, checking existing registrations...');
    
    const { data: existing } = await supabase
      .from('tournament_registrations')
      .select('user_id')
      .eq('tournament_id', tournamentId);
      
    console.log(`📊 Existing registrations: ${existing?.length || 0}`);
  }
  
  // Verify final state
  const { data: final } = await supabase
    .from('tournament_registrations')
    .select('user_id, registration_status')
    .eq('tournament_id', tournamentId);
    
  console.log(`\n🏆 Final state: ${final?.length || 0} registrations`);
  console.log('✅ Ready for SABOBracketGenerator!');
}

addTestRegistrations().catch(console.error);
