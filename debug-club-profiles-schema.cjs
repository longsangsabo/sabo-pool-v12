const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkClubProfilesSchema() {
  try {
    console.log('🔍 Checking club_profiles table schema...');
    
    // Try to get table structure from information_schema
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'club_profiles' })
      .single();
      
    if (schemaError) {
      console.log('Schema RPC failed, trying direct query...');
      
      // Alternative: try to select from the table to see what fields exist
      const { data: sampleData, error: selectError } = await supabase
        .from('club_profiles')
        .select('*')
        .limit(1);
        
      if (selectError) {
        console.log('❌ Error accessing club_profiles:', selectError);
      } else {
        console.log('✅ Sample data structure:', JSON.stringify(sampleData, null, 2));
      }
    } else {
      console.log('✅ Table schema:', columns);
    }
    
    // Try inserting test data to see what fields are required
    console.log('\n🧪 Testing required fields...');
    
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      club_name: 'Test Club',
      address: 'Test Address',
      phone: '0123456789',
      verification_status: 'pending'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('club_profiles')
      .insert(testData)
      .select();
      
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      console.log('Details:', insertError);
      
      // Try with name field
      console.log('\n🔄 Trying with name field...');
      const testDataWithName = {
        ...testData,
        name: 'Test Club Name'
      };
      
      const { data: insertData2, error: insertError2 } = await supabase
        .from('club_profiles')
        .insert(testDataWithName)
        .select();
        
      if (insertError2) {
        console.log('❌ Insert with name also failed:', insertError2.message);
      } else {
        console.log('✅ Insert with name succeeded!');
        // Clean up test data
        await supabase
          .from('club_profiles')
          .delete()
          .eq('club_name', 'Test Club');
      }
    } else {
      console.log('✅ Insert test succeeded!');
      // Clean up test data
      await supabase
        .from('club_profiles')
        .delete()
        .eq('club_name', 'Test Club');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

checkClubProfilesSchema();
