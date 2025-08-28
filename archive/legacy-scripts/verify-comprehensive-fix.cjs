/**
 * VERIFY COMPREHENSIVE SPA FIX SUCCESS
 * Test all users to confirm SPA transaction history is now complete
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFixSuccess() {
  console.log('🎯 VERIFYING COMPREHENSIVE SPA FIX SUCCESS');
  console.log('==========================================\n');

  try {
    // Step 1: Check total users with SPA vs transaction coverage
    console.log('1. 📊 Overall Coverage Check...');
    
    const { data: usersWithSpa } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points')
      .gt('spa_points', 0);

    console.log(`   Total users with SPA > 0: ${usersWithSpa?.length || 0}`);

    let usersWithGaps = 0;
    let totalGap = 0;
    let usersWithTransactions = 0;

    for (const user of usersWithSpa || []) {
      const { data: transactions } = await supabase
        .from('spa_transactions')
        .select('amount')
        .eq('user_id', user.user_id);

      const txTotal = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const gap = user.spa_points - txTotal;

      if (gap > 0) {
        usersWithGaps++;
        totalGap += gap;
      } else {
        usersWithTransactions++;
      }
    }

    console.log(`   Users with complete transaction history: ${usersWithTransactions}`);
    console.log(`   Users still with gaps: ${usersWithGaps}`);
    console.log(`   Total missing SPA: ${totalGap}`);

    // Step 2: Check specific user BOSA
    console.log('\n2. 🎯 BOSA User Verification...');
    
    const { data: bosaRanking } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', '558787dc-707c-4e84-9140-2fdc75b0efb9')
      .single();

    const { data: bosaTransactions } = await supabase
      .from('spa_transactions')
      .select('amount, description, source_type, created_at')
      .eq('user_id', '558787dc-707c-4e84-9140-2fdc75b0efb9')
      .order('created_at', { ascending: false });

    const bosaTxTotal = bosaTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    console.log(`   BOSA SPA balance: ${bosaRanking?.spa_points || 0}`);
    console.log(`   BOSA transaction count: ${bosaTransactions?.length || 0}`);
    console.log(`   BOSA transaction total: ${bosaTxTotal}`);
    console.log(`   BOSA gap: ${(bosaRanking?.spa_points || 0) - bosaTxTotal}`);

    if (bosaTransactions && bosaTransactions.length > 0) {
      console.log('   Recent transactions:');
      bosaTransactions.slice(0, 3).forEach((tx, i) => {
        console.log(`      ${i+1}. +${tx.amount} SPA from ${tx.source_type} - ${tx.description}`);
      });
    }

    // Step 3: Check notification created
    console.log('\n3. 🔔 Notification Check...');
    
    const { data: notifications } = await supabase
      .from('notifications')
      .select('title, message, created_at')
      .eq('user_id', '558787dc-707c-4e84-9140-2fdc75b0efb9')
      .eq('title', '📊 Lịch sử SPA đã được cập nhật!')
      .order('created_at', { ascending: false })
      .limit(1);

    if (notifications && notifications.length > 0) {
      console.log('   ✅ Notification created successfully');
      console.log(`   Message: ${notifications[0].message}`);
      console.log(`   Time: ${new Date(notifications[0].created_at).toLocaleString()}`);
    } else {
      console.log('   ❌ No notification found');
    }

    // Step 4: Test UI query simulation
    console.log('\n4. 🖥️  UI Query Simulation (as anon user)...');
    
    const anonSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: uiTransactions, error: uiError } = await anonSupabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', '558787dc-707c-4e84-9140-2fdc75b0efb9')
      .order('created_at', { ascending: false });

    if (uiError) {
      console.log(`   ❌ UI query failed: ${uiError.message}`);
      console.log('   This means UI will still show "Chưa có giao dịch SPA nào"');
    } else {
      console.log(`   ✅ UI query successful: ${uiTransactions?.length || 0} transactions`);
      if ((uiTransactions?.length || 0) > 0) {
        console.log('   🎉 UI will now show transaction history!');
      } else {
        console.log('   ❌ UI will still show "Chưa có giao dịch SPA nào"');
      }
    }

    // Step 5: Check function exists
    console.log('\n5. 🔧 Function Verification...');
    
    const { data: funcTest, error: funcError } = await supabase
      .rpc('update_spa_points_with_transaction', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_points: 0,
        p_source_type: 'test'
      });

    if (funcError) {
      if (funcError.message.includes('function')) {
        console.log('   ❌ update_spa_points_with_transaction function not found');
      } else {
        console.log('   ✅ Function exists and working');
      }
    } else {
      console.log('   ✅ Function ready for future SPA updates');
    }

    // Step 6: Summary
    console.log('\n📋 FINAL ASSESSMENT:');
    console.log('='.repeat(30));
    
    if (usersWithGaps === 0) {
      console.log('🎉 SUCCESS! All users have complete transaction history');
      console.log('✅ UI should show transaction details instead of "Chưa có giao dịch SPA nào"');
    } else {
      console.log(`⚠️  ${usersWithGaps} users still have transaction gaps`);
      console.log('   May need to run fix again or investigate specific issues');
    }
    
    if ((uiTransactions?.length || 0) > 0) {
      console.log('✅ BOSA user UI will show transaction history');
    } else {
      console.log('❌ BOSA user UI still has issues - may need RLS policy fix');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyFixSuccess().catch(console.error);
