import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function renameSABOTable() {
  console.log('🔄 Renaming sabo_tournament_matches to tournament_matches...');
  
  try {
    // Step 1: Check if old tournament_matches exists and backup
    console.log('1️⃣ Checking for existing tournament_matches table...');
    
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'tournament_matches');
    
    if (tablesError) {
      console.log('⚠️ Could not check existing tables (this is normal)');
    }
    
    // Step 2: Backup existing tournament_matches if it exists
    if (existingTables && existingTables.length > 0) {
      console.log('2️⃣ Backing up existing tournament_matches table...');
      const backupName = `tournament_matches_backup_${new Date().toISOString().replace(/[:.]/g, '_')}`;
      
      const { error: backupError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE tournament_matches RENAME TO ${backupName};`
      });
      
      if (backupError) {
        console.error('❌ Error backing up table:', backupError);
      } else {
        console.log(`✅ Backed up existing table to ${backupName}`);
      }
    }
    
    // Step 3: Rename sabo_tournament_matches to tournament_matches
    console.log('3️⃣ Renaming sabo_tournament_matches to tournament_matches...');
    
    const { error: renameError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE sabo_tournament_matches RENAME TO tournament_matches;'
    });
    
    if (renameError) {
      console.error('❌ Error renaming table:', renameError);
      process.exit(1);
    }
    
    console.log('✅ Successfully renamed sabo_tournament_matches to tournament_matches');
    
    // Step 4: Verify the rename was successful
    console.log('4️⃣ Verifying table rename...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('tournament_matches')
      .select('id')
      .limit(1);
      
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Table rename verified successfully!');
      console.log('🎯 SABO 10 functions should now work with tournament_matches table');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

renameSABOTable();
