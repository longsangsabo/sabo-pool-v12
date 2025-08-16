const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function runFixScript() {
  console.log('🔧 RUNNING FIX NOTIFICATIONS TABLE SCRIPT...\n');
  
  try {
    // Read the SQL file
    const sqlScript = fs.readFileSync('fix-notifications-table.sql', 'utf8');
    
    // Execute the SQL script
    console.log('📋 Executing fix-notifications-table.sql...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_script: sqlScript });
    
    if (error) {
      console.log('❌ Script execution failed:', error.message);
      
      // Try executing parts manually
      console.log('\n🔧 Trying manual fixes...');
      
      // Check if table exists
      console.log('1. Checking table structure...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'notifications');
      
      if (tableError) {
        console.log('❌ Could not check table:', tableError.message);
      } else {
        console.log('✅ Current columns:', tableInfo.map(col => col.column_name).join(', '));
        
        // Check which columns are missing
        const requiredColumns = [
          'category', 'icon', 'priority', 'is_read', 'is_archived',
          'challenge_id', 'tournament_id', 'club_id', 'match_id',
          'action_text', 'action_url', 'metadata', 'scheduled_for', 'expires_at', 'updated_at'
        ];
        
        const existingColumns = tableInfo.map(col => col.column_name);
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log('❌ Missing columns:', missingColumns.join(', '));
          console.log('\n🔧 MANUAL STEPS NEEDED:');
          console.log('Go to Supabase Dashboard → SQL Editor and run:');
          console.log('');
          
          missingColumns.forEach(col => {
            switch(col) {
              case 'category':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} VARCHAR(30) NOT NULL DEFAULT 'general';`);
                break;
              case 'icon':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} VARCHAR(50) DEFAULT 'bell';`);
                break;
              case 'priority':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} VARCHAR(10) NOT NULL DEFAULT 'medium';`);
                break;
              case 'is_read':
              case 'is_archived':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} BOOLEAN NOT NULL DEFAULT false;`);
                break;
              case 'challenge_id':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} UUID REFERENCES challenges(id) ON DELETE SET NULL;`);
                break;
              case 'tournament_id':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} UUID REFERENCES tournaments(id) ON DELETE SET NULL;`);
                break;
              case 'club_id':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} UUID REFERENCES clubs(id) ON DELETE SET NULL;`);
                break;
              case 'match_id':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} UUID;`);
                break;
              case 'action_text':
              case 'action_url':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} TEXT;`);
                break;
              case 'metadata':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} JSONB DEFAULT '{}';`);
                break;
              case 'scheduled_for':
              case 'expires_at':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} TIMESTAMPTZ;`);
                break;
              case 'updated_at':
                console.log(`ALTER TABLE notifications ADD COLUMN ${col} TIMESTAMPTZ DEFAULT NOW();`);
                break;
            }
          });
          
          console.log('');
          console.log('Then add the constraint:');
          console.log(`ALTER TABLE notifications ADD CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'));`);
          
        } else {
          console.log('✅ All required columns exist!');
        }
      }
      
    } else {
      console.log('✅ Script executed successfully!');
      console.log('Data:', data);
      
      // Test the fix by checking table structure
      console.log('\n📋 Verifying table structure...');
      const { data: finalCheck, error: checkError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'notifications')
        .order('ordinal_position');
      
      if (!checkError) {
        console.log('✅ Final table structure:');
        finalCheck.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
        });
      }
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

runFixScript();
