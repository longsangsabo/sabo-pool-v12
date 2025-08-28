import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://gprrhjtnyzzgkixzvhyj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnJoanRueXp6Z2tpeHp2aHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNjQ5OTE3NywiZXhwIjoyMDIyMDc1MTc3fQ.rJqR2R1DqGKa8sDKUw7QGX0bKOAEYwxNYu_UWA9fKiY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSafeApprovalFunction() {
    console.log('🔧 Creating safe approval function...');
    
    try {
        // Read the SQL file
        const sql = fs.readFileSync('create-safe-approval-function.sql', 'utf8');
        
        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
            console.error('❌ Error executing SQL:', error);
            
            // Try direct execution approach
            console.log('🔄 Trying direct execution...');
            const { data: directData, error: directError } = await supabase
                .from('_dummy_table_that_doesnt_exist')
                .select('*')
                .limit(0);
            
            // Try using a simpler approach
            const sqlCommands = sql.split(';').filter(cmd => cmd.trim());
            
            for (let i = 0; i < sqlCommands.length; i++) {
                const command = sqlCommands[i].trim();
                if (command) {
                    console.log(`Executing command ${i + 1}/${sqlCommands.length}...`);
                    try {
                        const { error: cmdError } = await supabase.rpc('exec', { sql: command });
                        if (cmdError) {
                            console.log(`Command ${i + 1} error:`, cmdError.message);
                        } else {
                            console.log(`✅ Command ${i + 1} executed successfully`);
                        }
                    } catch (e) {
                        console.log(`Command ${i + 1} failed:`, e.message);
                    }
                }
            }
        } else {
            console.log('✅ SQL executed successfully:', data);
        }
        
        // Test if the function exists
        console.log('\n🧪 Testing function existence...');
        const { data: testData, error: testError } = await supabase.rpc('manual_approve_rank_request', {
            p_request_id: '00000000-0000-0000-0000-000000000000',
            p_approver_id: '00000000-0000-0000-0000-000000000000'
        });
        
        if (testError) {
            if (testError.message.includes('Request not found')) {
                console.log('✅ Function exists and working (expected "Request not found" error)');
            } else {
                console.log('❌ Function test error:', testError.message);
            }
        } else {
            console.log('✅ Function test result:', testData);
        }
        
    } catch (error) {
        console.error('❌ Execution failed:', error);
    }
}

executeSafeApprovalFunction();
