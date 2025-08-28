const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getTableStructure() {
  try {
    console.log('🔍 Getting club_profiles table structure...');
    
    // Use PostgreSQL system tables to get column info
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'club_profiles' 
            AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
      
    if (error) {
      console.log('❌ RPC failed, trying direct SQL...', error);
      
      // Try alternative approach
      const { data: altData, error: altError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'club_profiles')
        .eq('table_schema', 'public');
        
      if (altError) {
        console.log('❌ Alternative failed:', altError);
      } else {
        console.log('✅ Table structure:', altData);
      }
    } else {
      console.log('✅ Table structure:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getTableStructure();
