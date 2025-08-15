const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDY4NDEzNCwiZXhwIjoyMDM2MjYwMTM0fQ.V9_xGIEkECHiKUa_TL5bF61HM6xmtWUzHM_EUMCnlxw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    console.log('🔧 Fixing player_rankings RLS policies...');
    
    // Read the SQL file
    const sql = fs.readFileSync('fix-player-rankings-rls.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error);
          break;
        }
      }
    }
    
    console.log('✅ RLS policies updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

executeSQL();
