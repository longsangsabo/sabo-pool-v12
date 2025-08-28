/**
 * TEST WITH SERVICE ROLE KEY
 * Check if transactions were actually created by the migration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testWithServiceRole() {
  console.log('🔧 TESTING WITH SERVICE ROLE KEY');
  console.log('=================================\n');

  try {
    // Test if transactions were created by migration
    console.log('1. 📊 Checking all legacy transactions...');
    
    const { data: legacyTx, error: legacyError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('source_type', 'legacy_award')
      .order('created_at', { ascending: false });

    if (legacyError) {
      console.log('❌ Error:', legacyError.message);
      return;
    }

    console.log(`✅ Found ${legacyTx.length} legacy transactions created by migration`);
    
    if (legacyTx.length > 0) {
      console.log('\n📋 Sample legacy transactions:');
      legacyTx.slice(0, 5).forEach((tx, i) => {
        console.log(`${i+1}. User: ${tx.user_id.substring(0, 8)}... | +${tx.amount} SPA`);
        console.log(`   Description: ${tx.description}`);
        console.log(`   Created: ${new Date(tx.created_at).toLocaleString()}`);
      });
    }

    // Check BOSA user specifically
    console.log('\n2. 👤 Checking BOSA user specifically...');
    
    const bosUserId = '558787dc-707c-4e84-9140-2fdc75b0efb9';
    
    const { data: bosaTransactions, error: bosaError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', bosUserId);

    if (bosaError) {
      console.log('❌ Error:', bosaError.message);
    } else {
      console.log(`✅ BOSA has ${bosaTransactions.length} transaction records`);
      
      if (bosaTransactions.length > 0) {
        bosaTransactions.forEach((tx, i) => {
          console.log(`   ${i+1}. +${tx.amount} SPA from ${tx.source_type}`);
          console.log(`      Description: ${tx.description}`);
        });
      }
    }

    // Check total users with transactions
    console.log('\n3. 📈 Migration impact analysis...');
    
    const { data: userStats, error: statsError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            COUNT(DISTINCT pr.user_id) as total_users_with_spa,
            COUNT(DISTINCT st.user_id) as users_with_transactions,
            COUNT(st.id) as total_transactions
          FROM player_rankings pr
          LEFT JOIN spa_transactions st ON st.user_id = pr.user_id
          WHERE pr.spa_points > 0
        `
      });

    if (!statsError && userStats) {
      console.log(`   Total users with SPA: ${userStats[0]?.total_users_with_spa || 0}`);
      console.log(`   Users with transactions: ${userStats[0]?.users_with_transactions || 0}`);
      console.log(`   Total transaction records: ${userStats[0]?.total_transactions || 0}`);
    }

    // Check RLS policies
    console.log('\n4. 🔒 RLS Policy Check...');
    
    const { data: policies, error: policyError } = await supabase
      .rpc('sql', {
        query: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE tablename = 'spa_transactions'
        `
      });

    if (!policyError && policies) {
      console.log(`   Found ${policies.length} RLS policies on spa_transactions:`);
      policies.forEach((policy, i) => {
        console.log(`   ${i+1}. ${policy.policyname} (${policy.cmd})`);
        console.log(`      Roles: ${policy.roles}`);
        console.log(`      Condition: ${policy.qual}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWithServiceRole().catch(console.error);
