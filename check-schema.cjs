const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('🔍 Checking actual tournament table schema...');
  
  // Try to get a sample tournament to see available columns
  const { data: sample, error } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error fetching tournaments:', error);
  } else if (sample && sample.length > 0) {
    console.log('📋 Available columns from existing data:', Object.keys(sample[0]));
  } else {
    console.log('📋 No existing tournaments found');
    
    // Try to insert minimal test to see what columns are actually available
    const testData = {
      name: 'Schema Test ' + Date.now(),
      tournament_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data: insertTest, error: insertError } = await supabase
      .from('tournaments')
      .insert([testData])
      .select('*');
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      
      if (insertError.message.includes('location')) {
        console.log('🚨 CONFIRMED: location column does not exist');
      }
      if (insertError.message.includes('venue_address')) {
        console.log('🚨 MAYBE: venue_address column exists');
      }
    } else {
      console.log('✅ Insert successful, columns:', Object.keys(insertTest[0]));
      // Cleanup
      await supabase.from('tournaments').delete().eq('id', insertTest[0].id);
    }
  }
}

checkSchema();
