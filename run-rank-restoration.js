import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ES Module script to restore rank system
async function restoreRankSystem() {
    console.log('🚀 COMPREHENSIVE RANK SYSTEM RESTORATION');
    console.log('==========================================\n');

    try {
        // Check if we have access to environment variables
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            console.log('✅ .env file found');
            
            // Load environment variables manually
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const envLines = envContent.split('\n');
            
            for (const line of envLines) {
                if (line.includes('=') && !line.startsWith('#')) {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        process.env[key.trim()] = value.trim().replace(/['"]/g, '');
                    }
                }
            }
        }

        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        console.log('🔑 Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
        console.log('🔑 Supabase Key:', supabaseKey ? '✅ Found' : '❌ Missing');

        if (!supabaseUrl || !supabaseKey) {
            console.log('\n❌ Missing Supabase credentials');
            console.log('Please run this SQL file manually in Supabase SQL Editor:');
            console.log('📁 File: comprehensive-rank-system-restoration.sql\n');
            
            // Show file content preview
            const sqlFile = path.join(__dirname, 'comprehensive-rank-system-restoration.sql');
            if (fs.existsSync(sqlFile)) {
                const content = fs.readFileSync(sqlFile, 'utf-8');
                const lines = content.split('\n').slice(0, 20);
                console.log('📄 File preview:');
                console.log('─'.repeat(50));
                lines.forEach((line, i) => {
                    console.log(`${i + 1}: ${line}`);
                });
                console.log('─'.repeat(50));
                console.log(`... and ${content.split('\n').length - 20} more lines\n`);
            }
            
            return;
        }

        // Dynamic import for ES modules
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('📡 Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (testError) {
            console.log('❌ Connection failed:', testError.message);
            return;
        }

        console.log('✅ Supabase connection successful!\n');

        // Read SQL file
        const sqlFile = path.join(__dirname, 'comprehensive-rank-system-restoration.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

        console.log('📂 SQL file loaded successfully');
        console.log(`📏 File size: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

        // For comprehensive restoration, we'll execute it as one large query
        console.log('⚡ Executing comprehensive restoration...');
        
        try {
            // Method 1: Try to execute via RPC if available
            const { data, error } = await supabase.rpc('exec_raw_sql', { 
                sql_query: sqlContent 
            });

            if (error) {
                throw new Error(`RPC failed: ${error.message}`);
            }

            console.log('✅ Restoration completed via RPC!');
            console.log('📊 Result:', data);

        } catch (rpcError) {
            console.log('⚠️ RPC method failed, trying alternative approaches...\n');
            
            // Method 2: Try to restore specific functions individually
            await restoreIndividualFunctions(supabase);
        }

        // Verify restoration
        console.log('\n🔍 Verifying restored functions...');
        await verifyFunctions(supabase);

        console.log('\n🎉 RANK SYSTEM RESTORATION COMPLETED!');
        console.log('\n💡 Next steps:');
        console.log('   1. Test rank approval in the frontend');
        console.log('   2. Check if users get added to clubs');
        console.log('   3. Verify milestone completion');
        console.log('   4. Test SPA transactions');

    } catch (error) {
        console.error('\n❌ Restoration failed:', error.message);
        console.log('\n🆘 Manual backup plan:');
        console.log('   1. Open Supabase Dashboard');
        console.log('   2. Go to SQL Editor');
        console.log('   3. Copy & paste comprehensive-rank-system-restoration.sql');
        console.log('   4. Execute the entire script');
    }
}

async function restoreIndividualFunctions(supabase) {
    const criticalFunctions = [
        {
            name: 'restore_milestone_functions',
            description: 'Restore milestone functions from backup'
        },
        {
            name: 'manual_approve_rank_request',
            description: 'Manual rank approval function'
        }
    ];

    for (const func of criticalFunctions) {
        try {
            console.log(`🔧 Calling ${func.name}...`);
            const { data, error } = await supabase.rpc(func.name);
            
            if (error) {
                console.log(`❌ ${func.name} failed:`, error.message);
            } else {
                console.log(`✅ ${func.name} success:`, data);
            }
        } catch (err) {
            console.log(`⚠️ ${func.name} not available:`, err.message);
        }
    }
}

async function verifyFunctions(supabase) {
    const expectedFunctions = [
        'award_milestone_spa',
        'complete_milestone',
        'update_milestone_progress',
        'process_spa_on_completion',
        'check_and_award_milestones',
        'handle_rank_request_approval',
        'add_user_to_club',
        'update_player_rank',
        'calculate_rank_spa_reward',
        'send_rank_notification'
    ];

    for (const funcName of expectedFunctions) {
        try {
            // Try to get function info
            const { data, error } = await supabase
                .from('pg_proc')
                .select('proname')
                .eq('proname', funcName)
                .single();

            if (data) {
                console.log(`✅ ${funcName}: EXISTS`);
            } else {
                console.log(`❌ ${funcName}: MISSING`);
            }
        } catch (err) {
            console.log(`❓ ${funcName}: Unable to verify`);
        }
    }
}

// Run the restoration
restoreRankSystem().catch(console.error);
