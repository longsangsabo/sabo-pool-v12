const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTournamentPrizesTable() {
  try {
    console.log('🔄 Reading SQL file...');
    const sqlContent = fs.readFileSync('./tournament_prizes_table_fixed.sql', 'utf8');
    
    // Split the SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_statement: statement + ';' 
        });
        
        if (error) {
          // Try direct execution if rpc fails
          const { data: directData, error: directError } = await supabase
            .from('_sql')
            .select('*')
            .limit(0); // This will fail but allow us to execute raw SQL

          // Try using a raw query approach
          console.log('⚠️  RPC failed, trying alternative approach...');
          
          // For table creation, we can check if it exists first
          if (statement.includes('CREATE TABLE tournament_prizes')) {
            const { data: tableCheck } = await supabase
              .from('tournament_prizes')
              .select('*')
              .limit(1);
            
            if (tableCheck) {
              console.log('✅ Table tournament_prizes already exists');
              continue;
            }
          }
          
          throw error;
        }
        
        console.log('✅ Statement executed successfully');
      } catch (statementError) {
        console.error(`❌ Error executing statement: ${statementError.message}`);
        
        // Continue with non-critical errors
        if (
          statementError.message.includes('already exists') ||
          statementError.message.includes('relation already exists') ||
          statementError.message.includes('duplicate key')
        ) {
          console.log('⚠️  Skipping due to existing resource');
          continue;
        }
        
        throw statementError;
      }
    }

    console.log('\n🎉 Tournament prizes table setup completed successfully!');

    // Verify the table was created
    console.log('\n🔍 Verifying table creation...');
    const { data, error } = await supabase
      .from('tournament_prizes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Table verification failed:', error.message);
    } else {
      console.log('✅ Table tournament_prizes is accessible');
    }

  } catch (error) {
    console.error('❌ Failed to create tournament prizes table:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTournamentPrizesTable();
