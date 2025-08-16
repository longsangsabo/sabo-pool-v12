// =====================================================
// CHECK MILESTONE SPA INTEGRATION
// =====================================================
// Kiểm tra xem SPA có được cộng thực tế khi hoàn thành milestone

const { createClient } = require('@supabase/supabase-js');

// Use .env file with dotenv
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

console.log('🔍 CHECKING MILESTONE SPA INTEGRATION');
console.log('='.repeat(60));

// Tạo Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMilestoneSpaIntegration() {
    try {
        console.log('\n📊 1. KIỂM TRA MILESTONE COMPLETION & SPA REWARD...');
        
        // Kiểm tra milestones đã hoàn thành
        const { data: completedMilestones, error: completedError } = await supabase
            .from('player_milestones')
            .select(`
                *,
                milestones:milestone_id (
                    name,
                    spa_reward,
                    milestone_type
                )
            `)
            .eq('is_completed', true)
            .order('completed_at', { ascending: false })
            .limit(10);
            
        if (completedError) {
            console.log('❌ Could not fetch completed milestones:', completedError.message);
            return;
        }
        
        console.log(`✅ Found ${completedMilestones?.length || 0} completed milestones`);
        
        if (completedMilestones && completedMilestones.length > 0) {
            console.log('\n🏆 RECENT COMPLETED MILESTONES:');
            completedMilestones.forEach((pm, index) => {
                const milestone = pm.milestones;
                console.log(`   ${index + 1}. "${milestone?.name}" - ${milestone?.spa_reward || 0} SPA`);
                console.log(`      Player: ${pm.player_id.slice(0,8)}... | Completed: ${new Date(pm.completed_at).toLocaleString()}`);
            });
        }

        console.log('\n💰 2. KIỂM TRA SPA TRANSACTION HISTORY...');
        
        // Kiểm tra spa_transactions để xem có ghi nhận milestone rewards không
        const { data: spaTransactions, error: spaError } = await supabase
            .from('spa_transactions')
            .select('*')
            .like('description', '%milestone%')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (spaError) {
            console.log('❌ Could not fetch SPA transactions:', spaError.message);
        } else {
            console.log(`💰 Found ${spaTransactions?.length || 0} milestone-related SPA transactions`);
            
            if (spaTransactions && spaTransactions.length > 0) {
                console.log('\n💳 MILESTONE SPA TRANSACTIONS:');
                spaTransactions.forEach((tx, index) => {
                    console.log(`   ${index + 1}. ${tx.amount > 0 ? '+' : ''}${tx.amount} SPA`);
                    console.log(`      User: ${tx.user_id?.slice(0,8)}... | ${tx.description}`);
                    console.log(`      Date: ${new Date(tx.created_at).toLocaleString()}`);
                });
            } else {
                console.log('   ⚠️ KHÔNG CÓ SPA TRANSACTION NÀO CHO MILESTONE!');
                console.log('   🚨 ĐÂY CÓ THỂ LÀ VẤN ĐỀ: SPA không được cộng khi hoàn thành milestone');
            }
        }

        console.log('\n🔧 3. KIỂM TRA MILESTONE SERVICE INTEGRATION...');
        
        // Đọc milestoneService.ts để kiểm tra SPA integration
        const fs = require('fs');
        const path = require('path');
        
        try {
            const milestoneServicePath = path.join(process.cwd(), 'src', 'services', 'milestoneService.ts');
            const milestoneServiceContent = fs.readFileSync(milestoneServicePath, 'utf8');
            
            // Kiểm tra các integration points
            const hasSpaService = milestoneServiceContent.includes('spaService');
            const hasAddSpaCall = milestoneServiceContent.includes('addSPA') || milestoneServiceContent.includes('add_spa');
            const hasRewardDistribution = milestoneServiceContent.includes('spa_reward') || milestoneServiceContent.includes('reward');
            const hasTransactionCreation = milestoneServiceContent.includes('spa_transaction') || milestoneServiceContent.includes('transaction');
            
            console.log('🔍 MILESTONE SERVICE CODE ANALYSIS:');
            console.log(`   📦 SpaService imported: ${hasSpaService ? '✅ YES' : '❌ NO'}`);
            console.log(`   💰 SPA addition call: ${hasAddSpaCall ? '✅ YES' : '❌ NO'}`);
            console.log(`   🏆 Reward distribution: ${hasRewardDistribution ? '✅ YES' : '❌ NO'}`);
            console.log(`   💳 Transaction creation: ${hasTransactionCreation ? '✅ YES' : '❌ NO'}`);
            
            // Tìm các function liên quan đến milestone completion
            const functions = [];
            const functionMatches = milestoneServiceContent.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g);
            for (const match of functionMatches) {
                functions.push(match[1]);
            }
            
            const milestoneCompletionFunctions = functions.filter(fn => 
                fn.toLowerCase().includes('milestone') || 
                fn.toLowerCase().includes('complete') ||
                fn.toLowerCase().includes('award') ||
                fn.toLowerCase().includes('reward')
            );
            
            console.log(`\n🎯 MILESTONE-RELATED FUNCTIONS: ${milestoneCompletionFunctions.length} found`);
            milestoneCompletionFunctions.forEach((fn, index) => {
                console.log(`   ${index + 1}. ${fn}()`);
            });
            
        } catch (fileError) {
            console.log('⚠️ Could not read milestoneService.ts:', fileError.message);
        }

        console.log('\n🔬 4. KIỂM TRA SPA SERVICE INTEGRATION...');
        
        try {
            const spaServicePath = path.join(process.cwd(), 'src', 'services', 'spaService.ts');
            const spaServiceContent = fs.readFileSync(spaServicePath, 'utf8');
            
            const hasAddSpaFunction = spaServiceContent.includes('addSPA') || spaServiceContent.includes('add_spa');
            const hasMilestoneSource = spaServiceContent.includes('milestone') || spaServiceContent.includes('MILESTONE');
            
            console.log('🔍 SPA SERVICE CODE ANALYSIS:');
            console.log(`   ➕ AddSPA function: ${hasAddSpaFunction ? '✅ YES' : '❌ NO'}`);
            console.log(`   🏆 Milestone source support: ${hasMilestoneSource ? '✅ YES' : '❌ NO'}`);
            
        } catch (fileError) {
            console.log('⚠️ Could not read spaService.ts:', fileError.message);
        }

        console.log('\n🧪 5. TESTING SPA INTEGRATION...');
        
        // Test user SPA balance
        const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
        
        const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('spa_balance, full_name')
            .eq('user_id', testUserId)
            .single();
            
        if (profileError) {
            console.log('❌ Could not fetch user profile:', profileError.message);
        } else {
            console.log(`👤 Test User: ${userProfile?.full_name || 'Unknown'}`);
            console.log(`💰 Current SPA Balance: ${userProfile?.spa_balance || 0} SPA`);
        }

        // Kiểm tra user's completed milestones
        const { data: userMilestones, error: userMilestonesError } = await supabase
            .from('player_milestones')
            .select(`
                *,
                milestones:milestone_id (name, spa_reward)
            `)
            .eq('player_id', testUserId)
            .eq('is_completed', true);
            
        if (userMilestonesError) {
            console.log('❌ Could not fetch user milestones:', userMilestonesError.message);
        } else {
            const totalExpectedSpa = userMilestones?.reduce((total, pm) => 
                total + (pm.milestones?.spa_reward || 0), 0) || 0;
                
            console.log(`\n🏆 USER MILESTONE ANALYSIS:`);
            console.log(`   Completed milestones: ${userMilestones?.length || 0}`);
            console.log(`   Expected SPA from milestones: ${totalExpectedSpa} SPA`);
            console.log(`   Current SPA balance: ${userProfile?.spa_balance || 0} SPA`);
            
            if (totalExpectedSpa > 0 && userProfile?.spa_balance >= totalExpectedSpa) {
                console.log(`   ✅ SPA balance seems correct (>= expected)`);
            } else if (totalExpectedSpa > 0) {
                console.log(`   ⚠️ SPA balance might be missing ${totalExpectedSpa - (userProfile?.spa_balance || 0)} SPA`);
            }
        }

        console.log('\n🎯 6. KIỂM TRA DATABASE TRIGGERS...');
        
        // Kiểm tra triggers có tồn tại không
        try {
            const { data: triggers, error: triggerError } = await supabase
                .from('pg_trigger')
                .select('tgname')
                .like('tgname', '%milestone%');
                
            if (triggerError) {
                console.log('⚠️ Could not check triggers (limited permissions)');
            } else if (triggers && triggers.length > 0) {
                console.log(`🔧 Found ${triggers.length} milestone-related triggers:`);
                triggers.forEach((trigger, index) => {
                    console.log(`   ${index + 1}. ${trigger.tgname}`);
                });
            } else {
                console.log('⚠️ No milestone-related triggers found');
            }
        } catch (triggerError) {
            console.log('⚠️ Could not check database triggers');
        }

        console.log('\n📋 7. SUMMARY & RECOMMENDATIONS...');
        
        const issues = [];
        const working = [];
        
        if (completedMilestones && completedMilestones.length > 0) {
            working.push('Users can complete milestones');
        } else {
            issues.push('No completed milestones found');
        }
        
        if (spaTransactions && spaTransactions.length > 0) {
            working.push('SPA transactions for milestones exist');
        } else {
            issues.push('No SPA transactions for milestones found');
        }
        
        console.log('✅ WORKING COMPONENTS:');
        working.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item}`);
        });
        
        if (issues.length > 0) {
            console.log('\n❌ POTENTIAL ISSUES:');
            issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }
        
        console.log('\n🔧 RECOMMENDATIONS:');
        
        if (issues.includes('No SPA transactions for milestones found')) {
            console.log('🚨 CRITICAL: SPA not being awarded for milestone completion!');
            console.log('');
            console.log('🛠️ SOLUTION NEEDED:');
            console.log('1. Check milestoneService.ts integration with spaService');
            console.log('2. Ensure milestone completion calls spaService.addSPA()');
            console.log('3. Verify SPA transaction creation in completion flow');
            console.log('4. Test milestone completion end-to-end');
            console.log('');
            console.log('📝 CODE REVIEW NEEDED:');
            console.log('• milestoneService.ts → checkAndAwardMilestone()');
            console.log('• spaService.ts → addSPA() function');
            console.log('• Database triggers for milestone_awards table');
        } else {
            console.log('✅ SPA integration appears to be working correctly');
        }

    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

// Chạy check
checkMilestoneSpaIntegration();
