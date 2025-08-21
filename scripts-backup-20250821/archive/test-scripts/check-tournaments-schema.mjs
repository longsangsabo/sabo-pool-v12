import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTournamentsSchema() {
  console.log('🔍 Checking tournaments table schema...');
  
  // Test query without missing columns
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error:', error);
  } else if (data && data.length > 0) {
    console.log('✅ Available columns in tournaments table:');
    Object.keys(data[0]).forEach(col => console.log('- ' + col));
  } else {
    console.log('⚠️ No tournaments found');
  }
  
  // Check specific tournament
  const { data: testTournament } = await supabase
    .from('tournaments')
    .select('id, name, tournament_type, status')
    .eq('id', '9833f689-ea2b-44a3-8184-323f9f7bb29a')
    .single();
    
  if (testTournament) {
    console.log('🎯 Test tournament found:', testTournament);
  } else {
    console.log('❌ Test tournament not found');
  }
}

checkTournamentsSchema().catch(console.error);
