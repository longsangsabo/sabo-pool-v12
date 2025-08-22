const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testClubRegistrationWithRealUser() {
  try {
    console.log('🧪 Testing club registration with real user...');
    
    // Find a real user first
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
      
    if (userError || !users || users.length === 0) {
      console.log('❌ No users found or error:', userError);
      return;
    }
    
    const testUserId = users[0].user_id;
    console.log('👤 Using test user:', testUserId);
    
    // Check if user already has club profile
    const { data: existing } = await supabase
      .from('club_profiles')
      .select('id')
      .eq('user_id', testUserId);
      
    if (existing && existing.length > 0) {
      console.log('⚠️ User already has club profile, skipping test');
      return;
    }
    
    // Test data with correct structure
    const testData = {
      user_id: testUserId,
      club_name: 'Test Club Registration Schema Fix',
      name: 'Test Club Registration Schema Fix', // Required field
      address: 'Test Address 123',
      phone: '0123456789',
      description: '',
      verification_status: 'pending',
    };
    
    console.log('📋 Test data structure:', {
      ...testData,
      user_id: '[REAL_USER_ID]' // Hide actual ID in log
    });
    
    // Try to insert test data
    const { data, error } = await supabase
      .from('club_profiles')
      .insert(testData)
      .select();
      
    if (error) {
      console.error('❌ Error inserting test data:', error);
    } else {
      console.log('✅ Test insert successful! Schema fix works correctly.');
      console.log('📊 Inserted record:', {
        id: data[0].id,
        club_name: data[0].club_name,
        name: data[0].name,
        verification_status: data[0].verification_status
      });
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('club_profiles')
        .delete()
        .eq('id', data[0].id);
        
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

testClubRegistrationWithRealUser();
