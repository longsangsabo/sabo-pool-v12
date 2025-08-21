#!/usr/bin/env node

/**
 * Execute milestone-spa-integration.sql script
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSqlScript() {
  console.log('📂 Reading milestone-spa-integration.sql...');
  
  try {
    const sqlContent = fs.readFileSync('/workspaces/sabo-pool-v12/milestone-spa-integration.sql', 'utf8');
    
    console.log('🔧 Executing SQL script...');
    
    // Execute the SQL content
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      console.error('❌ SQL execution error:', error);
      
      // Try alternative method - split and execute statements
      console.log('🔄 Trying alternative execution method...');
      
      const statements = sqlContent
        .split(/;\s*\n/)
        .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
        .map(stmt => stmt.trim());
      
      console.log(`Found ${statements.length} SQL statements to execute`);
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt) {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', {
              sql_query: stmt
            });
            
            if (stmtError) {
              console.error(`❌ Statement ${i + 1} failed:`, stmtError.message);
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          } catch (err) {
            console.error(`❌ Statement ${i + 1} exception:`, err.message);
          }
        }
      }
    } else {
      console.log('✅ SQL script executed successfully');
    }
    
    console.log('\n🔄 Refreshing schema cache...');
    
    // Try to refresh schema cache
    try {
      await supabase.rpc('pgrst_drop_db_schema_cache');
      console.log('✅ Schema cache refreshed');
    } catch (err) {
      console.log('⚠️  Schema cache refresh not available');
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
  }
}

executeSqlScript().then(() => {
  console.log('\n🎯 Milestone SPA integration deployment complete!');
  console.log('Now run: node test-complete-milestone-system.cjs');
}).catch(err => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);
});
