// =====================================================
// CHECK SPA SYSTEM & TABLES
// =====================================================
// Kiểm tra chi tiết SPA system và database structure

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 CHECKING SPA SYSTEM & DATABASE STRUCTURE');
console.log('='.repeat(60));

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSpaSystem() {
    try {
        console.log('\n📊 1. CHECKING DATABASE TABLES...');
        
        // Check spa_transactions table
        console.log('\n💳 Checking spa_transactions table...');
        try {
            const { data: spaTransactions, error: spaError } = await supabase
                .from('spa_transactions')
                .select('*')
                .limit(1);
                
            if (spaError) {
                console.log(`❌ spa_transactions table error: ${spaError.message}`);
                if (spaError.message.includes('does not exist')) {
                    console.log('🚨 PROBLEM: spa_transactions table does not exist!');
                }
            } else {
                console.log('✅ spa_transactions table exists');
                console.log(`   Records: ${spaTransactions?.length || 0} (sample)`);
            }
        } catch (err) {
            console.log(`❌ spa_transactions access error: ${err.message}`);
        }

        // Check player_rankings table  
        console.log('\n🏆 Checking player_rankings table...');
        try {
            const { data: rankings, error: rankingsError } = await supabase
                .from('player_rankings')
                .select('user_id, spa_points')
                .limit(3);
                
            if (rankingsError) {
                console.log(`❌ player_rankings table error: ${rankingsError.message}`);
                if (rankingsError.message.includes('does not exist')) {
                    console.log('🚨 PROBLEM: player_rankings table does not exist!');
                } else if (rankingsError.message.includes('spa_points')) {
                    console.log('🚨 PROBLEM: spa_points column missing in player_rankings!');
                }
            } else {
                console.log('✅ player_rankings table exists with spa_points');
                console.log(`   Sample records: ${rankings?.length || 0}`);
                if (rankings && rankings.length > 0) {
                    rankings.forEach((record, index) => {
                        console.log(`   ${index + 1}. User: ${record.user_id?.slice(0,8)}... | SPA: ${record.spa_points || 0}`);
                    });
                }
            }
        } catch (err) {
            console.log(`❌ player_rankings access error: ${err.message}`);
        }

        // Check profiles table for spa_balance (fallback)
        console.log('\n👤 Checking profiles table for spa_balance...');
        try {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('user_id, spa_balance')
                .limit(1);
                
            if (profilesError) {
                if (profilesError.message.includes('spa_balance')) {
                    console.log('❌ profiles.spa_balance column does not exist');
                } else {
                    console.log(`❌ profiles table error: ${profilesError.message}`);
                }
            } else {
                console.log('✅ profiles table accessible (but spa_balance column missing)');
            }
        } catch (err) {
            console.log(`❌ profiles access error: ${err.message}`);
        }

        console.log('\n🔧 2. CHECKING RPC FUNCTIONS...');
        
        // Test update_spa_points RPC
        console.log('\n⚙️ Testing update_spa_points RPC...');
        try {
            const { data: rpcResult, error: rpcError } = await supabase
                .rpc('update_spa_points', {
                    p_user_id: 'test-user-id',
                    p_points_change: 0,
                    p_transaction_type: 'test',
                    p_description: 'test call',
                    p_reference_id: null
                });
                
            if (rpcError) {
                console.log(`❌ update_spa_points RPC error: ${rpcError.message}`);
                if (rpcError.message.includes('could not find function')) {
                    console.log('🚨 PROBLEM: update_spa_points RPC function does not exist!');
                } else if (rpcError.message.includes('relation') && rpcError.message.includes('does not exist')) {
                    console.log('🚨 PROBLEM: RPC function exists but references missing table!');
                }
            } else {
                console.log('✅ update_spa_points RPC function exists and callable');
                console.log(`   Test result: ${rpcResult}`);
            }
        } catch (err) {
            console.log(`❌ update_spa_points RPC exception: ${err.message}`);
        }

        console.log('\n🏆 3. CHECKING MILESTONE COMPLETION FLOW...');
        
        // Test milestone completion scenario
        const testUserId = 'e30e1d1d-d714-4678-b63c-9f403ea2aeac';
        
        // Get a milestone to test with
        const { data: testMilestone, error: milestoneError } = await supabase
            .from('milestones')
            .select('*')
            .eq('is_active', true)
            .limit(1)
            .single();
            
        if (milestoneError) {
            console.log('❌ Could not get test milestone:', milestoneError.message);
        } else {
            console.log(`✅ Test milestone: "${testMilestone.name}" (${testMilestone.spa_reward} SPA)`);
            
            // Check if user has any SPA balance tracking
            console.log('\n💰 Checking user SPA balance tracking...');
            
            // Try player_rankings first
            const { data: userRanking, error: rankingError } = await supabase
                .from('player_rankings')
                .select('spa_points')
                .eq('user_id', testUserId)
                .single();
                
            if (rankingError) {
                console.log(`❌ User SPA balance check failed: ${rankingError.message}`);
                
                // Check if user record exists at all
                const { data: userExists } = await supabase
                    .from('player_rankings')
                    .select('user_id')
                    .eq('user_id', testUserId)
                    .single();
                    
                if (!userExists) {
                    console.log('🚨 PROBLEM: User not found in player_rankings table!');
                    console.log('   This means SPA cannot be awarded - no record to update');
                }
            } else {
                console.log(`✅ User SPA balance: ${userRanking?.spa_points || 0} SPA`);
            }
        }

        console.log('\n📋 4. ANALYSIS & DIAGNOSIS...');
        
        const issues = [];
        const solutions = [];
        
        // Analyze what we found
        console.log('\n🔍 DIAGNOSIS:');
        
        // Check for missing tables
        try {
            await supabase.from('spa_transactions').select('count').limit(1);
        } catch {
            issues.push('spa_transactions table missing');
            solutions.push('Create spa_transactions table for transaction history');
        }
        
        try {
            await supabase.from('player_rankings').select('spa_points').limit(1);
        } catch {
            issues.push('player_rankings.spa_points column missing');
            solutions.push('Add spa_points column to player_rankings table');
        }
        
        // Check for missing RPC
        try {
            await supabase.rpc('update_spa_points', {
                p_user_id: 'test',
                p_points_change: 0,
                p_transaction_type: 'test'
            });
        } catch (err) {
            if (err.message.includes('could not find function')) {
                issues.push('update_spa_points RPC function missing');
                solutions.push('Create update_spa_points RPC function');
            }
        }
        
        console.log('\n❌ IDENTIFIED ISSUES:');
        issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
        
        console.log('\n🛠️ REQUIRED SOLUTIONS:');
        solutions.forEach((solution, index) => {
            console.log(`   ${index + 1}. ${solution}`);
        });
        
        if (issues.length === 0) {
            console.log('\n✅ SPA SYSTEM APPEARS TO BE WORKING CORRECTLY!');
        } else {
            console.log('\n🚨 SPA SYSTEM NEEDS DATABASE SETUP!');
            console.log('');
            console.log('🎯 ROOT CAUSE:');
            console.log('Milestone service calls spaService.addSPAPoints() correctly,');
            console.log('but the underlying database structure is missing:');
            console.log('• No spa_transactions table for history');
            console.log('• No spa_points column in player_rankings');
            console.log('• No update_spa_points RPC function');
            console.log('');
            console.log('📝 SOLUTION:');
            console.log('Need to create complete SPA database structure');
        }

    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

// Run the check
checkSpaSystem();
