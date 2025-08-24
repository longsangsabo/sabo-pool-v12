const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function debugTriggers() {
  console.log('🔍 Checking triggers on challenges table...');
  
  try {
    // Simple query to get function definitions that contain challenger_rank
    const { data, error } = await supabase
      .from('information_schema.routines')  
      .select('*')
      .ilike('routine_definition', '%challenger_rank%');

    if (error) {
      console.log('❌ Error:', error);
    } else {
      console.log('📋 Functions with challenger_rank:', data);
    }

    // Try direct SQL execution
    const { data: result, error: sqlError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT proname, prosrc 
        FROM pg_proc 
        WHERE prosrc LIKE '%challenger_rank%' 
        LIMIT 5;
      `
    });

    if (sqlError) {
      console.log('❌ SQL Error:', sqlError);
    } else {
      console.log('📋 Direct SQL result:', result);
    }

  } catch (error) {
    console.log('❌ Debug Error:', error);
  }
}

debugTriggers();
