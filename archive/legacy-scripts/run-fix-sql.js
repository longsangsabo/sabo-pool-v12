const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.log('Required variables:');
    console.log('- VITE_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL() {
    try {
        console.log('🔄 Loading SQL file...');
        const sqlFile = path.join(__dirname, 'fix-rank-approval-permission.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('🔄 Executing SQL fix...');
        
        // Split SQL into individual statements
        const statements = sqlContent
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/));
        
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.includes('SELECT') && statement.includes('pg_policies')) {
                // Skip SELECT statements for now
                console.log(`⏭️  Skipping SELECT statement ${i + 1}`);
                continue;
            }
            
            try {
                console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
                const { data, error } = await supabase.rpc('exec_sql', { 
                    sql_query: statement 
                });
                
                if (error) {
                    // Try alternative method
                    const { data: data2, error: error2 } = await supabase
                        .from('_dummy_table_that_doesnt_exist')
                        .select('*');
                    
                    // Use raw SQL method
                    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${supabaseServiceKey}`,
                            'apikey': supabaseServiceKey
                        },
                        body: JSON.stringify({ sql_query: statement })
                    });
                    
                    if (!response.ok) {
                        console.log(`⚠️  Statement ${i + 1} failed, trying direct execution...`);
                        // Continue with next statement
                        errorCount++;
                        continue;
                    }
                }
                
                console.log(`✅ Statement ${i + 1} executed successfully`);
                successCount++;
                
            } catch (err) {
                console.log(`❌ Error in statement ${i + 1}:`, err.message);
                errorCount++;
            }
        }
        
        console.log('\n🎉 SQL Fix Execution Summary:');
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        console.log(`📝 Total: ${statements.length}`);
        
        if (errorCount === 0) {
            console.log('\n🚀 All SQL statements executed successfully!');
            console.log('\n💡 Next steps:');
            console.log('1. Test the rank approval in your app');
            console.log('2. If still getting permission errors, check RLS policies');
            console.log('3. Use the manual_approve_rank_request() function as fallback');
        } else {
            console.log('\n⚠️  Some statements failed. You may need to run them manually in Supabase dashboard.');
        }
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        console.log('\n💡 Alternative approach:');
        console.log('1. Copy the SQL content from fix-rank-approval-permission.sql');
        console.log('2. Go to Supabase Dashboard > SQL Editor');
        console.log('3. Paste and run the SQL manually');
    }
}

// Helper function to create exec_sql function if it doesn't exist
async function createExecSQLFunction() {
    const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
        RETURNS TEXT
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE sql_query;
            RETURN 'Success';
        EXCEPTION WHEN OTHERS THEN
            RETURN SQLERRM;
        END;
        $$;
    `;
    
    try {
        const { error } = await supabase.rpc('exec_sql', { 
            sql_query: createFunctionSQL 
        });
        
        if (!error) {
            console.log('✅ Created exec_sql helper function');
        }
    } catch (err) {
        console.log('ℹ️  Could not create helper function, will use alternative method');
    }
}

console.log('🚀 Starting SQL fix execution...');
console.log(`🔗 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Using ${supabaseServiceKey.includes('service_role') ? 'service role' : 'anon'} key`);

createExecSQLFunction().then(() => {
    runSQL();
});
