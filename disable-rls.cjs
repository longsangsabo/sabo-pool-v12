// Script để disable RLS cho các bảng SABO
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Service role key có quyền admin

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.log('Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  try {
    console.log('🔧 Disabling RLS for SABO tables...');
    
    // Disable RLS for sabo_tournament_matches
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE sabo_tournament_matches DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.error('❌ Error disabling RLS:', error);
    } else {
      console.log('✅ Successfully disabled RLS for sabo_tournament_matches');
    }
    
    // Test query after disabling RLS
    console.log('🧪 Testing query after disabling RLS...');
    const testResult = await supabase
      .from('sabo_tournament_matches')
      .select('count(*)', { count: 'exact' });
      
    console.log('✅ Test query result:', testResult);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

disableRLS();
