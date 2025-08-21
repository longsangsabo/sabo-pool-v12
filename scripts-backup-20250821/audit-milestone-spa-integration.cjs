#!/usr/bin/env node

/**
 * Milestone SPA Integration Audit
 * Checks if milestone completion properly awards SPA points
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditMilestoneSpaIntegration() {
  console.log('🔍 MILESTONE SPA INTEGRATION AUDIT');
  console.log('=================================\n');

  try {
    // Test 1: Check SPA-related functions exist
    console.log('💰 Test 1: SPA Award Functions');
    console.log('------------------------------');
    
    const spaFunctions = [
      'award_milestone_spa',
      'update_milestone_progress', 
      'complete_milestone'
    ];
    
    for (const func of spaFunctions) {
      try {
        // Test with dummy data to check if function exists
        const { error } = await supabase.rpc(func, {});
        
        if (error && error.code === '42883') {
          console.log(`❌ Function '${func}': Not found`);
        } else {
          console.log(`✅ Function '${func}': Available`);
        }
      } catch (err) {
        console.log(`❌ Function '${func}': ${err.message}`);
      }
    }

    // Test 2: Check SPA transactions table
    console.log('\n💳 Test 2: SPA Transactions System');
    console.log('----------------------------------');
    
    try {
      const { data, error } = await supabase
        .from('spa_transactions')
        .select('id, source_type')
        .eq('source_type', 'milestone_award')
        .limit(5);
        
      if (error) {
        console.log(`❌ SPA transactions: ${error.message}`);
      } else {
        console.log(`✅ SPA transactions table: Available`);
        console.log(`   └─ Milestone awards recorded: ${data?.length || 0}`);
      }
    } catch (err) {
      console.log(`❌ SPA transactions: ${err.message}`);
    }

    // Test 3: Check player rankings table (SPA balance)
    console.log('\n📊 Test 3: Player Rankings (SPA Balance)');
    console.log('----------------------------------------');
    
    try {
      const { data, error } = await supabase
        .from('player_rankings')
        .select('player_id, spa_points')
        .limit(1);
        
      if (error) {
        console.log(`❌ Player rankings: ${error.message}`);
      } else {
        console.log(`✅ Player rankings table: Available`);
        if (data && data.length > 0) {
          console.log(`   └─ Sample SPA balance: ${data[0].spa_points || 0} points`);
        }
      }
    } catch (err) {
      console.log(`❌ Player rankings: ${err.message}`);
    }

    // Test 4: Check milestone awards table
    console.log('\n🏆 Test 4: Milestone Awards Tracking');
    console.log('-----------------------------------');
    
    try {
      const { data, error } = await supabase
        .from('milestone_awards')
        .select('id, user_id, milestone_id, spa_awarded')
        .limit(5);
        
      if (error) {
        console.log(`❌ Milestone awards: ${error.message}`);
      } else {
        console.log(`✅ Milestone awards table: Available`);
        console.log(`   └─ Awards recorded: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          const totalSpa = data.reduce((sum, award) => sum + (award.spa_awarded || 0), 0);
          console.log(`   └─ Total SPA awarded: ${totalSpa} points`);
        }
      }
    } catch (err) {
      console.log(`❌ Milestone awards: ${err.message}`);
    }

    // Test 5: Check if milestone completion triggers SPA award
    console.log('\n⚡ Test 5: Integration Flow Test');
    console.log('-------------------------------');
    
    console.log('Testing with dummy data to check integration...');
    
    // Test if we can call the milestone completion flow
    try {
      const testUserId = '00000000-0000-0000-0000-000000000000';
      
      // Try to call award_milestone_spa function
      const { data, error } = await supabase.rpc('award_milestone_spa', {
        p_user_id: testUserId,
        p_spa_amount: 10,
        p_milestone_name: 'Test Milestone',
        p_milestone_id: '00000000-0000-0000-0000-000000000001'
      });
      
      if (error) {
        console.log(`❌ SPA award integration: ${error.message}`);
        
        if (error.message.includes('does not exist')) {
          console.log('   💡 Missing award_milestone_spa function - needs implementation');
        }
      } else {
        console.log(`✅ SPA award integration: Function works`);
        console.log(`   └─ Result: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`❌ SPA award integration: ${err.message}`);
    }

    // Test 6: Check for automation triggers
    console.log('\n🤖 Test 6: Milestone Automation');
    console.log('-------------------------------');
    
    try {
      const { data, error } = await supabase
        .from('automation_tasks')
        .select('id, automation_type')
        .eq('automation_type', 'milestone_check')
        .limit(5);
        
      if (error) {
        console.log(`❌ Milestone automation: ${error.message}`);
      } else {
        if (data && data.length > 0) {
          console.log(`✅ Milestone automation: ${data.length} tasks found`);
        } else {
          console.log(`ℹ️  Milestone automation: Manual system (no automated tasks)`);
        }
      }
    } catch (err) {
      console.log(`❌ Milestone automation: ${err.message}`);
    }

    console.log('\n🎯 AUDIT SUMMARY');
    console.log('================');
    console.log('Milestone SPA integration audit completed.');
    console.log('Check results above for any missing components.');
    
    console.log('\n💡 REQUIRED FOR FULL INTEGRATION:');
    console.log('1. award_milestone_spa() function - Awards SPA and creates transaction');
    console.log('2. complete_milestone() function - Marks milestone complete + awards SPA');
    console.log('3. update_milestone_progress() function - Updates progress + checks completion');
    console.log('4. Integration triggers in game events (match completion, etc.)');

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

// Run audit
auditMilestoneSpaIntegration().then(() => {
  console.log('\n✅ Milestone SPA integration audit completed');
}).catch(err => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});
