import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function addValidRegistrations() {
  console.log('👥 Adding valid test registrations with UUIDs...');
  
  const tournamentId = '9833f689-ea2b-44a3-8184-323f9f7bb29a';
  
  // Create test registrations with proper UUIDs
  const testPlayers = Array.from({ length: 16 }, (_, i) => ({
    user_id: uuidv4(),
    full_name: `Test Player ${i+1}`
  }));
  
  let successCount = 0;
  for (const player of testPlayers) {
    const { error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        user_id: player.user_id,
        registration_status: 'confirmed',
        registration_date: new Date().toISOString()
      });
      
    if (!error) {
      successCount++;
      console.log(`✅ ${successCount}/16: ${player.full_name}`);
    } else if (!error.message.includes('duplicate')) {
      console.log(`❌ Failed: ${player.full_name}`, error.message);
    }
  }
  
  console.log(`\n🎯 Successfully registered ${successCount}/16 players`);
  
  // Verify final state
  const { data: final } = await supabase
    .from('tournament_registrations')
    .select('user_id, registration_status')
    .eq('tournament_id', tournamentId);
    
  console.log(`\n🏆 Final state: ${final?.length || 0} registrations`);
  console.log('✅ Ready for SABOBracketGenerator!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to tournament "Winner Take All 9 Ball (RANK IK)"');
  console.log('2. Click "Quản lý" button');
  console.log('3. Look for SABOBracketGenerator component');
  console.log('4. Click "Generate SABO Bracket" with 16 players');
}

addValidRegistrations().catch(console.error);
