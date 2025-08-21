// Test Tournament với Authentication
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testWithAuth() {
  console.log('🔍 Testing tournament creation WITH AUTH...');
  
  try {
    // Check current auth state
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ No authenticated user found');
      console.log('🔄 Attempting test login...');
      
      // Try to login with test credentials (if available)
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123456'
      });
      
      if (loginError) {
        console.error('❌ Login failed:', loginError.message);
        console.log('📋 Available auth methods to test manually:');
        console.log('1. Login via UI first');
        console.log('2. Create test user');
        console.log('3. Disable RLS temporarily');
        return;
      }
      
      console.log('✅ Test login successful');
    } else {
      console.log('✅ User authenticated:', user.email);
    }
    
    // Now try creating tournament
    const minimalData = {
      name: 'Auth Test Tournament ' + Date.now(),
      tournament_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      tournament_type: 'single_elimination',
      status: 'registration_open'
    };

    const { data: result, error } = await supabase
      .from('tournaments')
      .insert([minimalData])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Tournament creation failed:', error);
    } else {
      console.log('✅ Tournament created successfully!', {
        id: result.id,
        name: result.name
      });
      
      // Cleanup
      await supabase.from('tournaments').delete().eq('id', result.id);
      console.log('🧹 Test tournament cleaned up');
    }
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

testWithAuth();
