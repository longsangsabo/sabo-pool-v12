/**
 * SIMPLE RETROACTIVE SPA FIX
 * Tạo transaction cho user BOSA cụ thể có 350 SPA
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixSpecificUser() {
  console.log('🔧 FIXING SPECIFIC USER WITH 350 SPA');
  console.log('===================================\n');

  const targetUserId = '558787dc-f3dc-43f0-8476-66e9b86c43dd'; // BOSA user

  try {
    // Step 1: Confirm user current state
    console.log('1. 🔍 Checking current user state...');
    
    const { data: ranking, error: rankError } = await supabase
      .from('player_rankings')
      .select('spa_points, updated_at')
      .eq('user_id', targetUserId)
      .single();

    if (rankError) {
      console.log('❌ Error getting user ranking:', rankError.message);
      return;
    }

    console.log(`   Current SPA: ${ranking.spa_points}`);
    console.log(`   Last updated: ${new Date(ranking.updated_at).toLocaleString()}`);

    // Step 2: Check existing transactions
    const { data: existingTx, error: txError } = await supabase
      .from('spa_transactions')
      .select('amount')
      .eq('user_id', targetUserId);

    const currentTxTotal = existingTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    const missingAmount = ranking.spa_points - currentTxTotal;

    console.log(`   Existing transactions: ${existingTx?.length || 0}`);
    console.log(`   Current transaction total: ${currentTxTotal} SPA`);
    console.log(`   Missing amount: ${missingAmount} SPA\n`);

    if (missingAmount <= 0) {
      console.log('✅ No fix needed - user already has complete transaction history');
      return;
    }

    // Step 3: Create retroactive transaction
    console.log('2. 💰 Creating retroactive transaction...');
    
    const { data: newTransaction, error: insertError } = await supabase
      .from('spa_transactions')
      .insert({
        user_id: targetUserId,
        amount: missingAmount,
        transaction_type: 'credit',
        source_type: 'legacy_award',
        description: 'Legacy SPA balance - Historical milestone rewards',
        status: 'completed',
        metadata: {
          retroactive: true,
          original_balance: ranking.spa_points,
          transaction_total: currentTxTotal,
          created_reason: 'Fix missing transaction history for UI display',
          fix_date: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error creating transaction:', insertError.message);
      return;
    }

    console.log('✅ Retroactive transaction created successfully!');
    console.log(`   Transaction ID: ${newTransaction.id}`);
    console.log(`   Amount: +${newTransaction.amount} SPA`);
    console.log(`   Description: ${newTransaction.description}\n`);

    // Step 4: Verify fix
    console.log('3. ✅ Verifying fix...');
    
    const { data: allTransactions } = await supabase
      .from('spa_transactions')
      .select('amount, description, created_at')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    const newTotal = allTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    console.log(`   Updated transaction count: ${allTransactions?.length || 0}`);
    console.log(`   Updated transaction total: ${newTotal} SPA`);
    console.log(`   SPA balance: ${ranking.spa_points} SPA`);
    
    if (newTotal === ranking.spa_points) {
      console.log('🎉 SUCCESS! SPA balance now matches transaction total');
      console.log('\n📱 Expected UI behavior:');
      console.log('   - User BOSA will now see transaction history');
      console.log('   - SPA tab will show "Legacy SPA balance - Historical milestone rewards: +350 SPA"');
      console.log('   - No more "Chưa có giao dịch SPA nào" message');
    } else {
      console.log('⚠️  Mismatch still exists - may need additional investigation');
    }

    // Step 5: Create notification for user
    console.log('\n4. 🔔 Creating notification...');
    
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'spa_award',
        title: '🎉 Lịch sử SPA đã được cập nhật!',
        message: `Chúng tôi đã thêm lịch sử giao dịch cho ${missingAmount} SPA hiện có của bạn. Bây giờ bạn có thể xem chi tiết trong tab SPA.`,
        icon: 'history',
        priority: 'medium',
        action_text: 'Xem chi tiết',
        action_url: '/profile?tab=spa',
        read: false,
        metadata: {
          transaction_id: newTransaction.id,
          retroactive_fix: true
        }
      });

    if (notifError) {
      console.log('⚠️  Could not create notification:', notifError.message);
    } else {
      console.log('✅ Notification created to inform user of the fix');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixSpecificUser().catch(console.error);
