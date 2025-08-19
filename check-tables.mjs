// Check available tables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('📊 Checking available tables...');

  // Try different tournament table names
  const tableNames = ['tournaments', 'sabo_tournaments', 'tournament_matches', 'sabo_tournament_matches'];

  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log('✅ Table exists:', tableName);
        if (data && data.length > 0) {
          console.log('   Sample data keys:', Object.keys(data[0]));
        } else {
          console.log('   Table is empty');
        }
      } else {
        console.log('❌ Table error:', tableName, error.message);
      }
    } catch (e) {
      console.log('❌ Table not found:', tableName, e.message);
    }
  }
}

checkTables();
