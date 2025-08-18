console.log('🚀 Basic test script starting...');

const { createClient } = require('@supabase/supabase-js');

console.log('📦 Loaded Supabase client');

require('dotenv').config();

console.log('⚙️ Loaded environment variables');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔑 Credentials loaded:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client created');

async function quickTest() {
  try {
    console.log('📡 Testing basic connection...');
    
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(1);
      
    if (error) {
      console.error('❌ Connection error:', error);
    } else {
      console.log('✅ Connection successful, tournament found:', data?.[0]?.name || 'None');
    }
    
  } catch (err) {
    console.error('💥 Test exception:', err);
  }
}

quickTest();
