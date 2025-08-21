const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ quiet: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSABOFunction() {
  console.log('🔍 Checking SABO function availability...');
  
  try {
    // Check if the function exists by calling it with invalid params
    const { data, error } = await supabase.rpc('generate_sabo_tournament_bracket', {
      p_tournament_id: 'test',
      p_seeding_method: 'test'
    });
    
    console.log('📡 Function call result:', { data, error: error?.message });
    
    if (error) {
      if (error.message.includes('does not exist') || error.code === '42883') {
        console.log('❌ SABO function does not exist in database');
      } else {
        console.log('✅ SABO function exists but returned error (expected)');
        console.log('🔍 Error details:', error);
      }
    } else {
      console.log('✅ SABO function exists and responded');
    }
    
  } catch (err) {
    console.error('💥 Exception:', err.message);
  }
}

checkSABOFunction();
