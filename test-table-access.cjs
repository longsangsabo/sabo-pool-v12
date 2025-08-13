const { createClient } = require('@supabase/supabase-js');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testApproveFunction = async () => {
  console.log('🧪 Testing current approve function approach...');
  
  try {
    // Just test if we can access the tables we need
    const { data: testRequest, error: requestError } = await supabase
      .from('rank_requests')
      .select('id, user_id, requested_rank, status')
      .eq('status', 'pending')
      .limit(1);
      
    if (requestError) {
      console.error('❌ Cannot access rank_requests:', requestError);
      return;
    }
    
    console.log('✅ Can access rank_requests table');
    console.log('📋 Sample pending requests:', testRequest?.length || 0);
    
    // Test club_members access
    const { data: testMember, error: memberError } = await supabase
      .from('club_members')
      .select('role, status')
      .limit(1);
      
    if (memberError) {
      console.error('❌ Cannot access club_members:', memberError);
      return;
    }
    
    console.log('✅ Can access club_members table');
    
    // Test profiles access
    const { data: testProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, verified_rank')
      .limit(1);
      
    if (profileError) {
      console.error('❌ Cannot access profiles:', profileError);
      return;
    }
    
    console.log('✅ Can access profiles table');
    
    console.log('🎯 All required tables are accessible. The issue is likely RLS policies.');
    console.log('💡 Try testing the rank approval in the web interface now.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testApproveFunction();
