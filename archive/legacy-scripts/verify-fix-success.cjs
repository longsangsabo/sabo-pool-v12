/**
 * VERIFY FIX SUCCESS với SERVICE ROLE KEY
 * Check tất cả users có transaction records chưa
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key để bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFixSuccess() {
  console.log('🔍 VERIFYING COMPREHENSIVE SPA FIX SUCCESS');
  console.log('=========================================\n');

  try {
    // Step 1: Check BOSA user specifically
    console.log('1. 👤 Checking BOSA user (558787dc...)...');
    
    const bosaUserId = '558787dc-707c-4e84-9140-2fdc75b0efb9';
    
    const { data: bosaTransactions, error: bosaError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', bosaUserId)
      .order('created_at', { ascending: false });

    if (bosaError) {
      console.log('❌ Error checking BOSA:', bosaError.message);
    } else {
      console.log(`   ✅ BOSA transactions: ${bosaTransactions.length}`);
      
      if (bosaTransactions.length > 0) {
        const total = bosaTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        console.log(`   💰 Total: ${total} SPA`);
        console.log('   📋 Latest transaction:');
        console.log(`      Amount: +${bosaTransactions[0].amount} SPA`);
        console.log(`      Source: ${bosaTransactions[0].source_type}`);
        console.log(`      Description: ${bosaTransactions[0].description}`);
        console.log(`      Created: ${new Date(bosaTransactions[0].created_at).toLocaleString()}`);
      }
    }

    // Step 2: Check overall fix statistics
    console.log('\n2. 📊 Overall fix statistics...');
    
    // Count users with SPA > 0
    const { count: usersWithSpa } = await supabase
      .from('player_rankings')
      .select('*', { count: 'exact', head: true })
      .gt('spa_points', 0);

    // Count total transaction records
    const { count: totalTransactions } = await supabase
      .from('spa_transactions')
      .select('*', { count: 'exact', head: true });

    // Count legacy award transactions (our fix)
    const { count: legacyTransactions } = await supabase
      .from('spa_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'legacy_award');

    console.log(`   👥 Users with SPA > 0: ${usersWithSpa || 0}`);
    console.log(`   📝 Total transaction records: ${totalTransactions || 0}`);
    console.log(`   🔧 Legacy fix transactions: ${legacyTransactions || 0}`);

    // Step 3: Check top users to see if they have transaction records
    console.log('\n3. 🏆 Checking top 5 SPA users...');
    
    const { data: topUsers, error: topError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .gt('spa_points', 0)
      .order('spa_points', { ascending: false })
      .limit(5);

    if (topError) {
      console.log('❌ Error getting top users:', topError.message);
    } else {
      for (const user of topUsers) {
        const { data: userTx } = await supabase
          .from('spa_transactions')
          .select('amount')
          .eq('user_id', user.user_id);

        const txTotal = userTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        const gap = user.spa_points - txTotal;
        
        console.log(`   👤 User ${user.user_id.substring(0, 8)}...:`);
        console.log(`      SPA Balance: ${user.spa_points}`);
        console.log(`      Transaction Total: ${txTotal}`);
        console.log(`      Gap: ${gap} ${gap === 0 ? '✅' : '❌'}`);
      }
    }

    // Step 4: Test UI query với anon key
    console.log('\n4. 🖥️  Testing UI perspective (anon key)...');
    
    const anonSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: uiTransactions, error: uiError } = await anonSupabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', bosaUserId);

    if (uiError) {
      console.log('❌ UI query failed (RLS issue):', uiError.message);
      console.log('   This explains why UI still shows "Chưa có giao dịch SPA nào"');
      console.log('   Need to fix RLS policies for spa_transactions table');
    } else {
      console.log(`✅ UI query successful: ${uiTransactions.length} transactions visible`);
      if (uiTransactions.length > 0) {
        console.log('   🎉 UI should now show transaction history!');
      }
    }

    // Step 5: Summary and next steps
    console.log('\n📋 SUMMARY:');
    console.log('===========');
    
    if (legacyTransactions && legacyTransactions > 0) {
      console.log(`✅ Fix executed successfully - created ${legacyTransactions} retroactive transactions`);
    }
    
    if (bosaTransactions && bosaTransactions.length > 0) {
      console.log('✅ BOSA user specifically fixed');
    }

    console.log('\n🔧 NEXT STEPS:');
    if (uiError) {
      console.log('1. Fix RLS policies for spa_transactions table to allow read access');
      console.log('2. Test UI again after RLS fix');
    } else {
      console.log('1. Test UI in browser - should see transaction history');
      console.log('2. All users should see SPA transaction details');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyFixSuccess().catch(console.error);
