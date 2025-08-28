const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testClubRegistration() {
  try {
    console.log('🧪 Testing club registration data structure...');
    
    // Test data matching the new structure
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      club_name: 'Test Club Registration',
      name: 'Test Club Registration', // Same as club_name to satisfy NOT NULL constraint
      address: 'Test Address 123',
      phone: '0123456789',
      description: '',
      verification_status: 'pending',
    };
    
    console.log('📋 Test data:', testData);
    
    // Try to insert test data
    const { data, error } = await supabase
      .from('club_profiles')
      .insert(testData)
      .select();
      
    if (error) {
      console.error('❌ Error inserting test data:', error);
    } else {
      console.log('✅ Test insert successful:', data);
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('club_profiles')
        .delete()
        .eq('user_id', testData.user_id);
        
      if (deleteError) {
        console.log('⚠️ Warning: Could not clean up test data:', deleteError);
      } else {
        console.log('🧹 Test data cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testClubRegistration();
