// Script để tạo policy cho bảng sabo_tournament_matches
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createReadPolicy() {
  try {
    console.log('🔧 Creating read policy for sabo_tournament_matches...');
    
    // Tạo policy cho SELECT
    const createPolicySQL = `
      CREATE POLICY "Allow public read access to sabo_tournament_matches" 
      ON sabo_tournament_matches 
      FOR SELECT 
      USING (true);
    `;
    
    // Thực thi SQL bằng cách gọi function có sẵn
    const { data, error } = await supabase.rpc('sql', {
      query: createPolicySQL
    });
    
    if (error) {
      console.log('❌ Error creating policy (might already exist):', error.message);
      
      // Thử enable RLS và policy khác
      console.log('🔧 Trying alternative approach - grant permissions...');
      
      // Tạo policy đơn giản hơn
      const simplePolicy = `
        DROP POLICY IF EXISTS "sabo_tournament_matches_read_policy" ON sabo_tournament_matches;
        CREATE POLICY "sabo_tournament_matches_read_policy" 
        ON sabo_tournament_matches 
        FOR SELECT 
        TO public
        USING (true);
      `;
      
      const { error: error2 } = await supabase.rpc('sql', {
        query: simplePolicy
      });
      
      if (error2) {
        console.log('❌ Alternative approach failed:', error2.message);
      } else {
        console.log('✅ Alternative policy created successfully');
      }
    } else {
      console.log('✅ Policy created successfully');
    }
    
    // Test lại với anon key
    console.log('🧪 Testing anon key access after policy creation...');
    const anonSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    const testResult = await anonSupabase
      .from('sabo_tournament_matches')
      .select('id')
      .eq('tournament_id', 'c41300b2-02f2-456a-9d6f-679b59177e8f')
      .limit(1);
      
    console.log('Anon key test result:', {
      data: testResult.data?.length || 0,
      error: testResult.error?.message || 'none'
    });
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createReadPolicy();
