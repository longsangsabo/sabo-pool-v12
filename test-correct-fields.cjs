const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testCorrectFields() {
  console.log('🔍 Testing with CORRECT field names...');
  
  // Test với venue_address thay vì location
  const testData = {
    name: 'Correct Fields Test ' + Date.now(),
    tournament_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    tournament_type: 'single_elimination',
    venue_address: 'Test Venue Address',
    max_participants: 16,
    status: 'registration_open'
  };
  
  console.log('📊 Test data:', testData);
  
  try {
    const { data: result, error } = await supabase
      .from('tournaments')
      .insert([testData])
      .select('*');
    
    if (error) {
      console.error('❌ Insert failed:', error.message);
      
      if (error.message.includes('venue_address')) {
        console.log('🚨 venue_address field issue');
      } else if (error.message.includes('location')) {
        console.log('🚨 Still trying location field');
      } else if (error.message.includes('row-level security')) {
        console.log('✅ Fields OK, just RLS blocking (need auth)');
      }
    } else {
      console.log('✅ SUCCESS! Tournament created with correct fields:', result[0].id);
      // Cleanup
      await supabase.from('tournaments').delete().eq('id', result[0].id);
    }
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

testCorrectFields();
