import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function setupSABOTournamentProperly() {
  const tournamentId = '9833f689-ea2b-44a3-8184-323f9f7bb29a';
  
  console.log('🏆 Setting up SABO tournament properly...');
  
  // 1. Delete manual matches first
  console.log('🗑️ Clearing manual matches...');
  await supabase
    .from('tournament_matches')
    .delete()
    .eq('tournament_id', tournamentId);
  
  // 2. Check current registrations
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('user_id, registration_status, profiles:user_id(full_name)')
    .eq('tournament_id', tournamentId);
    
  console.log(`📋 Current registrations: ${registrations?.length || 0}`);
  
  // 3. Add 16 test registrations if needed
  const needRegistrations = 16 - (registrations?.length || 0);
  console.log(`➕ Need to add: ${needRegistrations} registrations`);
  
  if (needRegistrations > 0) {
    // Get some user IDs for test registrations
    const { data: users } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(needRegistrations);
      
    if (users && users.length > 0) {
      for (let i = 0; i < Math.min(needRegistrations, users.length); i++) {
        const { error } = await supabase
          .from('tournament_registrations')
          .insert({
            tournament_id: tournamentId,
            user_id: users[i].user_id,
            registration_status: 'confirmed',
            registered_at: new Date().toISOString()
          });
          
        if (!error) {
          console.log(`✅ Added registration: ${users[i].full_name}`);
        }
      }
    }
  }
  
  // 4. Verify final state
  const { data: finalRegs } = await supabase
    .from('tournament_registrations')
    .select('user_id')
    .eq('tournament_id', tournamentId)
    .eq('registration_status', 'confirmed');
    
  console.log(`🎯 Final registrations: ${finalRegs?.length || 0}/16`);
  console.log('📝 Now use SABOBracketGenerator in UI to generate proper bracket!');
}

setupSABOTournamentProperly().catch(console.error);
