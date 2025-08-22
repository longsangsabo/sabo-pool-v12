import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug and fix rank approval script
async function debugAndFixRankApproval() {
    console.log('🔍 DEBUGGING RANK APPROVAL ISSUE');
    console.log('=================================\n');

    try {
        // Load environment variables
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
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

        if (!supabaseUrl || !supabaseKey) {
            console.log('❌ Missing Supabase credentials');
            console.log('\n📋 MANUAL STEPS TO DEBUG:');
            console.log('1. Open Supabase Dashboard → SQL Editor');
            console.log('2. Run debug-rank-approval.sql to check status');
            console.log('3. Run fix-frontend-rank-approval.sql to fix trigger');
            console.log('4. Run manual-rank-fix.sql if needed');
            return;
        }

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('✅ Connected to Supabase\n');

        // 1. Check recent approved requests
        console.log('🔍 Checking recent approved requests...');
        const { data: approvedRequests, error: requestError } = await supabase
            .from('rank_requests')
            .select('*')
            .eq('status', 'approved')
            .order('approved_at', { ascending: false })
            .limit(5);

        if (requestError) {
            console.log('❌ Error fetching requests:', requestError.message);
            return;
        }

        console.log(`📋 Found ${approvedRequests?.length || 0} approved requests\n`);

        if (approvedRequests && approvedRequests.length > 0) {
            const recentRequest = approvedRequests[0];
            console.log('🎯 Most recent approved request:');
            console.log(`   ID: ${recentRequest.id}`);
            console.log(`   User: ${recentRequest.user_id}`);
            console.log(`   Rank: ${recentRequest.requested_rank}`);
            console.log(`   Approved: ${recentRequest.approved_at}\n`);

            // Check if profile was updated
            const { data: profile } = await supabase
                .from('profiles')
                .select('verified_rank, rank_verified_at, updated_at')
                .eq('user_id', recentRequest.user_id)
                .single();

            console.log('👤 User profile status:');
            console.log(`   Verified Rank: ${profile?.verified_rank || 'NULL'}`);
            console.log(`   Rank Verified At: ${profile?.rank_verified_at || 'NULL'}`);
            console.log(`   Updated At: ${profile?.updated_at}\n`);

            // Check SPA transaction
            const { data: spaTransaction } = await supabase
                .from('spa_transactions')
                .select('*')
                .eq('user_id', recentRequest.user_id)
                .eq('reference_id', recentRequest.id)
                .eq('transaction_type', 'rank_approval')
                .single();

            console.log('💰 SPA Transaction:');
            console.log(`   Exists: ${spaTransaction ? 'YES' : 'NO'}`);
            if (spaTransaction) {
                console.log(`   Points: ${spaTransaction.points}`);
                console.log(`   Created: ${spaTransaction.created_at}`);
            }
            console.log('');

            // Check notification
            const { data: notification } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', recentRequest.user_id)
                .eq('type', 'rank_approval')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            console.log('🔔 Notification:');
            console.log(`   Exists: ${notification ? 'YES' : 'NO'}`);
            if (notification) {
                console.log(`   Title: ${notification.title}`);
                console.log(`   Created: ${notification.created_at}`);
            }
            console.log('');

            // If issues found, suggest fixes
            const hasIssues = !profile?.verified_rank || !spaTransaction || !notification;
            
            if (hasIssues) {
                console.log('❌ ISSUES FOUND! Profile/SPA/Notification not updated properly\n');
                console.log('🔧 SUGGESTED FIXES:');
                console.log('1. Run fix-frontend-rank-approval.sql to create auto-trigger');
                console.log('2. Run manual fix for this specific request:');
                console.log(`   SELECT manual_fix_rank_approval('${recentRequest.id}', false);`);
                console.log('');
                
                // Try manual fix
                try {
                    console.log('🛠️ Attempting manual fix...');
                    const { data: fixResult, error: fixError } = await supabase
                        .rpc('manual_fix_rank_approval', {
                            p_request_id: recentRequest.id,
                            p_force_update: false
                        });

                    if (fixError) {
                        console.log('❌ Manual fix failed:', fixError.message);
                        console.log('   Try running the SQL manually in Supabase Dashboard');
                    } else {
                        console.log('✅ Manual fix completed!');
                        console.log('   Result:', JSON.stringify(fixResult, null, 2));
                    }
                } catch (err) {
                    console.log('⚠️ Manual fix function not available');
                    console.log('   Run manual-rank-fix.sql first');
                }
            } else {
                console.log('✅ No issues found! Rank approval working properly');
            }
        } else {
            console.log('ℹ️ No approved requests found to analyze');
        }

        // Check if trigger exists
        console.log('\n🔍 Checking triggers...');
        const { data: triggers, error: triggerError } = await supabase
            .from('information_schema.triggers')
            .select('trigger_name, event_object_table')
            .eq('trigger_schema', 'public')
            .eq('event_object_table', 'rank_requests');

        if (triggers && triggers.length > 0) {
            console.log('✅ Triggers found:');
            triggers.forEach(t => console.log(`   - ${t.trigger_name}`));
        } else {
            console.log('❌ No triggers found on rank_requests table');
            console.log('   Run fix-frontend-rank-approval.sql to create trigger');
        }

        console.log('\n🏁 DIAGNOSIS COMPLETE!');
        console.log('\n💡 NEXT STEPS:');
        console.log('1. If issues found: Run fix-frontend-rank-approval.sql');
        console.log('2. Test rank approval in frontend');
        console.log('3. Monitor trigger logs for any errors');

    } catch (error) {
        console.error('\n❌ Debug failed:', error.message);
        console.log('\n🆘 FALLBACK PLAN:');
        console.log('1. Check database logs for errors');
        console.log('2. Run SQL files manually in Supabase Dashboard');
        console.log('3. Check RLS policies on rank_requests table');
    }
}

// Run the debug
debugAndFixRankApproval().catch(console.error);
