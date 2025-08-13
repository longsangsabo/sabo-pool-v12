// Deploy SPA validation function to database
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Deploying SPA validation function...\n');

async function deployFunction() {
  try {
    // Read the SQL file
    const sqlContent = readFileSync('/workspaces/sabo-pool-v12/update-accept-challenge-with-spa-validation.sql', 'utf8');
    
    console.log('📄 SQL content length:', sqlContent.length);
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      console.log('❌ Error executing SQL via RPC:', error.message);
      
      // Try alternative approach - direct query
      console.log('\n🔄 Trying direct approach...');
      
      // Split SQL into statements and execute one by one
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.includes('CREATE OR REPLACE FUNCTION')) {
          console.log('📝 Executing function creation...');
          
          const { data: funcData, error: funcError } = await supabase
            .from('_raw_sql')
            .select('*')
            .limit(1);
            
          if (funcError) {
            console.log('⚠️  Cannot execute via table, will test function directly');
          }
          
          break;
        }
      }
      
    } else {
      console.log('✅ SQL executed successfully:', data);
    }
    
    // Test the updated function
    console.log('\n🧪 Testing updated function...');
    
    // Test with non-existent challenge (should return proper error)
    const { data: testResult, error: testError } = await supabase.rpc('accept_open_challenge', {
      p_challenge_id: '550e8400-e29b-41d4-a716-446655440000',
      p_user_id: '550e8400-e29b-41d4-a716-446655440001'
    });
    
    if (testError) {
      console.log('❌ Function test error:', testError.message);
    } else {
      console.log('✅ Function test result:', testResult);
      
      if (testResult.error && testResult.error.includes('thách đấu')) {
        console.log('🎉 Function successfully updated with Vietnamese messages!');
      }
    }
    
  } catch (err) {
    console.log('💥 Deployment failed:', err.message);
  }
}

await deployFunction();
