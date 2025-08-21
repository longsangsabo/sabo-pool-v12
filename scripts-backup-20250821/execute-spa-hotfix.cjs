/**
 * DIRECT SQL EXECUTION VIA SUPABASE CLIENT
 * Execute the hotfix SQL directly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function executeHotfix() {
  console.log('🚀 EXECUTING SPA TRANSACTION HISTORY HOTFIX');
  console.log('==========================================\n');

  try {
    // Step 1: Create retroactive transaction for user BOSA specifically
    console.log('1. 💰 Creating retroactive transaction for BOSA user...');
    
    const { data: newTransaction, error: insertError } = await supabase
      .from('spa_transactions')
      .insert({
        user_id: '558787dc-707c-4e84-9140-2fdc75b0efb9', // BOSA user ID from previous query
        amount: 350,
        transaction_type: 'credit',
        source_type: 'legacy_award',
        description: 'Legacy SPA balance - Historical milestone rewards',
        status: 'completed',
        metadata: {
          retroactive: true,
          original_spa_balance: 350,
          existing_transaction_total: 0,
          created_reason: 'Fix missing transaction history for UI display',
          fix_timestamp: new Date().toISOString(),
          user_name: 'BOSA'
        }
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error creating transaction:', insertError.message);
      
      // Try alternative approach using RPC if available
      console.log('   Trying alternative approach...');
      
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('update_spa_points', {
          p_user_id: '558787dc-707c-4e84-9140-2fdc75b0efb9',
          p_points: 0, // Don't change balance, just create transaction record
          p_source_type: 'legacy_award',
          p_description: 'Legacy SPA balance - Historical milestone rewards',
          p_transaction_type: 'credit'
        });

      if (rpcError) {
        console.log('❌ RPC also failed:', rpcError.message);
        console.log('\n💡 ALTERNATIVE SOLUTION:');
        console.log('Since we cannot create transaction records programmatically,');
        console.log('the issue is likely due to RLS policies.');
        console.log('\nPlease manually run this SQL in Supabase Dashboard > SQL Editor:');
        console.log(`
INSERT INTO public.spa_transactions (
  user_id, amount, transaction_type, source_type, 
  description, status, metadata
) VALUES (
  '558787dc-707c-4e84-9140-2fdc75b0efb9',
  350,
  'credit',
  'legacy_award',
  'Legacy SPA balance - Historical milestone rewards',
  'completed',
  '{"retroactive": true, "created_reason": "Fix missing transaction history"}'::jsonb
);
        `);
        return;
      } else {
        console.log('✅ RPC succeeded:', rpcResult);
      }
    } else {
      console.log('✅ Transaction created successfully!');
      console.log(`   Transaction ID: ${newTransaction.id}`);
      console.log(`   Amount: +${newTransaction.amount} SPA`);

      // Step 2: Create notification
      console.log('\n2. 🔔 Creating notification...');
      
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: '558787dc-707c-4e84-9140-2fdc75b0efb9',
          type: 'spa_award',
          title: '📊 Lịch sử SPA đã được cập nhật!',
          message: 'Chúng tôi đã thêm lịch sử giao dịch cho 350 SPA của bạn. Giờ bạn có thể xem chi tiết trong tab SPA.',
          icon: 'history',
          priority: 'medium',
          action_text: 'Xem SPA',
          action_url: '/profile?tab=spa',
          read: false,
          metadata: {
            transaction_id: newTransaction.id,
            retroactive_fix: true,
            amount: 350
          }
        });

      if (notifError) {
        console.log('⚠️  Notification error:', notifError.message);
      } else {
        console.log('✅ Notification created');
      }
    }

    // Step 3: Verify the fix
    console.log('\n3. ✅ Verifying fix...');
    
    const { data: allTransactions } = await supabase
      .from('spa_transactions')
      .select('amount, description, created_at')
      .eq('user_id', '558787dc-707c-4e84-9140-2fdc75b0efb9')
      .order('created_at', { ascending: false });

    const totalFromTransactions = allTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    console.log(`   User BOSA transaction records: ${allTransactions?.length || 0}`);
    console.log(`   Total from transactions: ${totalFromTransactions} SPA`);
    
    if (totalFromTransactions === 350) {
      console.log('🎉 SUCCESS! UI should now show transaction history instead of "Chưa có giao dịch SPA nào"');
      console.log('\n📱 Expected behavior:');
      console.log('   - Open Profile → SPA tab');
      console.log('   - Should see "Legacy SPA balance - Historical milestone rewards: +350 SPA"');
      console.log('   - No more "Chưa có giao dịch SPA nào" message');
    } else {
      console.log('⚠️  Fix may not be complete - transaction total does not match SPA balance');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

executeHotfix().catch(console.error);
