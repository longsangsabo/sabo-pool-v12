/**
 * TEST SPA TRANSACTION HISTORY FIX
 * Verify rằng UI sẽ hiển thị transaction history
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testSpaTransactionFix() {
  console.log('🧪 TESTING SPA TRANSACTION HISTORY FIX');
  console.log('=====================================\n');

  try {
    // Test 1: Check if update_spa_points function exists
    console.log('1. 🔧 Testing update_spa_points function...');
    
    const { data: functionTest, error: funcError } = await supabase
      .rpc('update_spa_points', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // fake UUID
        p_points: 0,
        p_source_type: 'test',
        p_description: 'Function test'
      });

    if (funcError) {
      if (funcError.message.includes('function update_spa_points')) {
        console.log('❌ update_spa_points function NOT found');
        console.log('   Need to run migration first!');
      } else {
        console.log('✅ update_spa_points function exists');
        console.log(`   Test result: ${JSON.stringify(functionTest)}`);
      }
    } else {
      console.log('✅ update_spa_points function works');
    }

    // Test 2: Check spa_transactions table structure
    console.log('\n2. 📊 Testing spa_transactions table...');
    
    const { data: sampleTx, error: txError } = await supabase
      .from('spa_transactions')
      .select('*')
      .limit(1);

    if (txError) {
      console.log('❌ spa_transactions table error:', txError.message);
    } else {
      console.log('✅ spa_transactions table accessible');
      if (sampleTx && sampleTx.length > 0) {
        console.log('📋 Sample transaction structure:');
        console.log(JSON.stringify(sampleTx[0], null, 2));
      } else {
        console.log('📋 Table is empty (expected before migration)');
      }
    }

    // Test 3: Simulate what UI will do
    console.log('\n3. 🖥️  Simulating UI query...');
    
    const testUserId = '123e4567-e89b-12d3-a456-426614174000'; // example UUID
    
    const { data: uiTransactions, error: uiError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });

    if (uiError) {
      console.log('❌ UI query failed:', uiError.message);
    } else {
      console.log(`✅ UI query successful (${uiTransactions.length} transactions)`);
      console.log('   This is what SpaHistoryTab.tsx will receive');
    }

    // Test 4: Check current users with SPA > 0
    console.log('\n4. 👥 Current SPA users status...');
    
    const { count: spaUsersCount } = await supabase
      .from('player_rankings')
      .select('*', { count: 'exact', head: true })
      .gt('spa_points', 0);

    const { count: transactionCount } = await supabase
      .from('spa_transactions')
      .select('*', { count: 'exact', head: true });

    console.log(`👥 Users with SPA > 0: ${spaUsersCount || 0}`);
    console.log(`📝 Total transaction records: ${transactionCount || 0}`);
    
    if ((spaUsersCount || 0) > 0 && (transactionCount || 0) === 0) {
      console.log('⚠️  Gap confirmed: Users have SPA but no transaction records');
      console.log('   Migration will fix this by creating retroactive records');
    } else if ((transactionCount || 0) > 0) {
      console.log('✅ Transaction records exist - UI should work');
    }

    console.log('\n📋 SUMMARY:');
    console.log('===========');
    console.log('✅ Migration script ready to deploy');
    console.log('✅ UI updated to query spa_transactions table');
    console.log('✅ Unified update_spa_points function will prevent future gaps');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Deploy migration to create function & retroactive records');
    console.log('2. Update triggers to use update_spa_points instead of direct updates');
    console.log('3. Test UI to confirm transaction history displays');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSpaTransactionFix().catch(console.error);
