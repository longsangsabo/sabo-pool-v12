const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function findChallengerRankError() {
  console.log('🔍 Tìm kiếm lỗi challenger_rank...');
  
  try {
    // 1. Kiểm tra triggers trên challenges table
    console.log('\n📋 Checking triggers on challenges table...');
    const { data: triggers } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          t.trigger_name,
          t.event_manipulation,
          t.action_statement,
          p.prosrc as function_source
        FROM information_schema.triggers t
        LEFT JOIN pg_proc p ON p.proname = REPLACE(t.action_statement, 'EXECUTE FUNCTION ', '')
        WHERE t.event_object_table = 'challenges'
        ORDER BY t.trigger_name;
      `
    });
    
    console.log('📊 Triggers found:', triggers);
    
    // 2. Tìm functions có chứa challenger_rank
    console.log('\n🔍 Searching functions with challenger_rank...');
    const { data: functions } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          proname as function_name,
          prosrc as function_source
        FROM pg_proc 
        WHERE prosrc ILIKE '%challenger_rank%'
        ORDER BY proname;
      `
    });
    
    console.log('🎯 Functions with challenger_rank:', functions);
    
    // 3. Kiểm tra schema challenges table
    console.log('\n📋 Checking challenges table schema...');
    const { data: columns } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'challenges'
        ORDER BY ordinal_position;
      `
    });
    
    console.log('🏗️ Challenges table columns:', columns);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findChallengerRankError();
