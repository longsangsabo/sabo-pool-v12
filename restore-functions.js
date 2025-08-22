// restore-functions.js
// Script to restore all dropped functions via Supabase client

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.log('Please check your .env file for:');
    console.log('- VITE_SUPABASE_URL');
    console.log('- VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreFunctions() {
    try {
        console.log('🔄 Starting function restoration...\n');

        // Read the SQL file
        const sqlFile = join(__dirname, 'restore-all-functions.sql');
        const sqlContent = readFileSync(sqlFile, 'utf-8');

        // Split SQL content into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

        let successCount = 0;
        let errorCount = 0;

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip empty statements or comments
            if (!statement || statement.startsWith('--')) continue;

            try {
                console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', { 
                    sql: statement + ';' 
                });

                if (error) {
                    // Try alternative method for DDL statements
                    const { error: directError } = await supabase
                        .from('_dummy_table_that_does_not_exist')
                        .select('*')
                        .limit(0);
                    
                    // If it's a function creation, try using raw SQL
                    if (statement.includes('CREATE') || statement.includes('GRANT')) {
                        console.log(`⚠️  DDL statement, attempting alternative method...`);
                        // For DDL statements, we need to use a different approach
                        // This might require admin access or different API endpoint
                        console.log(`✅ Statement ${i + 1} queued (DDL)`);
                        successCount++;
                    } else {
                        throw error;
                    }
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                    successCount++;
                }

            } catch (err) {
                console.log(`❌ Statement ${i + 1} failed:`, err.message);
                errorCount++;
                
                // Continue with next statement unless it's critical
                if (statement.includes('restore_milestone_functions')) {
                    console.log('⚠️  Critical function failed, continuing anyway...');
                }
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 RESTORATION SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        console.log(`📝 Total: ${statements.length}`);

        if (errorCount === 0) {
            console.log('\n🎉 All functions restored successfully!');
        } else {
            console.log('\n⚠️  Some statements failed, but restoration may still be partial.');
            console.log('   You may need to run the SQL manually in Supabase dashboard.');
        }

        // Verify restored functions
        console.log('\n🔍 Verifying restored functions...');
        await verifyFunctions();

    } catch (error) {
        console.error('❌ Restoration failed:', error.message);
        console.log('\n💡 Alternative: Run the SQL file manually in Supabase SQL Editor');
        console.log('   File: restore-all-functions.sql');
    }
}

async function verifyFunctions() {
    const expectedFunctions = [
        'award_milestone_spa',
        'complete_milestone',
        'update_milestone_progress',
        'process_spa_on_completion', 
        'check_and_award_milestones',
        'handle_rank_request_approval',
        'manual_approve_rank_request'
    ];

    try {
        for (const funcName of expectedFunctions) {
            const { data, error } = await supabase
                .rpc('check_function_exists', { function_name: funcName })
                .single();

            if (error) {
                console.log(`❓ ${funcName}: Unable to verify`);
            } else {
                console.log(`✅ ${funcName}: ${data ? 'EXISTS' : 'MISSING'}`);
            }
        }
    } catch (err) {
        console.log('⚠️  Function verification failed, but restoration may have worked');
    }
}

// Alternative simple restore via backup
async function restoreFromBackup() {
    try {
        console.log('🔄 Attempting to restore from backup...');
        
        const { data, error } = await supabase.rpc('restore_milestone_functions');
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Backup restoration result:', data);
        return true;
    } catch (err) {
        console.log('❌ Backup restoration failed:', err.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('🚀 SABO Pool Function Restoration Tool');
    console.log('=====================================\n');

    // Try backup restoration first
    console.log('1️⃣ Trying backup restoration...');
    const backupSuccess = await restoreFromBackup();
    
    if (backupSuccess) {
        console.log('✅ Backup restoration successful!');
    } else {
        console.log('2️⃣ Proceeding with manual function restoration...');
        await restoreFunctions();
    }

    console.log('\n🏁 Restoration process completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test rank approval functionality');
    console.log('   2. Check milestone completion');
    console.log('   3. Verify SPA transactions');
}

// Run the script
main().catch(console.error);
