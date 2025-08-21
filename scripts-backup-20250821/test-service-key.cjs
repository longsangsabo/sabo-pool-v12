// Script để disable RLS cho các bảng SABO bằng SQL trực tiếp
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLSDirectly() {
  try {
    console.log('🔧 Attempting to disable RLS for SABO tables using service key...');
    
    // First, test normal query với anon key
    console.log('🧪 Testing with anon key first...');
    const anonSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    const anonResult = await anonSupabase
      .from('tournament_matches')
      .select('id')
      .eq('tournament_id', 'c41300b2-02f2-456a-9d6f-679b59177e8f')
      .limit(1);
      
    console.log('Anon key result:', {
      data: anonResult.data?.length || 0,
      error: anonResult.error?.message || 'none'
    });
    
    // Test với service key
    console.log('🧪 Testing with service key...');
    const serviceResult = await supabase
      .from('tournament_matches')
      .select('id')
      .eq('tournament_id', 'c41300b2-02f2-456a-9d6f-679b59177e8f')
      .limit(1);
      
    console.log('Service key result:', {
      data: serviceResult.data?.length || 0,
      error: serviceResult.error?.message || 'none'
    });
    
    // Nếu service key work, thử count toàn bộ
    if (!serviceResult.error && serviceResult.data) {
      const allMatches = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', 'c41300b2-02f2-456a-9d6f-679b59177e8f');
        
      console.log('✅ All matches with service key:', allMatches.data?.length || 0);
      
      if (allMatches.data && allMatches.data.length > 0) {
        console.log('🔍 Sample match:', allMatches.data[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

disableRLSDirectly();
