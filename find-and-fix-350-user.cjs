/**
 * FIND AND FIX USER WITH 350 SPA 
 * Tìm user có 350 SPA chính xác và fix
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function findAndFixUser350() {
  console.log('🎯 FINDING AND FIXING USER WITH 350 SPA');
  console.log('======================================\n');

  try {
    // Step 1: Find user with exactly 350 SPA
    console.log('1. 🔍 Finding user with 350 SPA...');
    
    const { data: users, error: findError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points, updated_at')
      .eq('spa_points', 350);

    if (findError) {
      console.log('❌ Error finding users:', findError.message);
      return;
    }

    console.log(`   Found ${users?.length || 0} users with exactly 350 SPA\n`);

    if (!users || users.length === 0) {
      console.log('❌ No users found with 350 SPA');
      return;
    }

    // Step 2: For each user, check their transaction gap
    for (const user of users) {
      console.log(`👤 Processing User ID: ${user.user_id}`);
      console.log(`   SPA: ${user.spa_points}`);

      // Get user name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.user_id)
        .single();

      console.log(`   Name: ${profile?.display_name || 'Unknown'}`);

      // Check existing transactions
      const { data: transactions } = await supabase
        .from('spa_transactions')
        .select('amount, description')
        .eq('user_id', user.user_id);

      const txTotal = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const gap = user.spa_points - txTotal;

      console.log(`   Transactions: ${transactions?.length || 0}`);
      console.log(`   Transaction total: ${txTotal} SPA`);
      console.log(`   Gap: ${gap} SPA`);

      if (gap > 0) {
        console.log(`   🚨 This user needs a fix!\n`);
        
        // Step 3: Create retroactive transaction
        console.log('2. 💰 Creating retroactive transaction...');
        
        const { data: newTx, error: insertError } = await supabase
          .from('spa_transactions')
          .insert({
            user_id: user.user_id,
            amount: gap,
            transaction_type: 'credit',
            source_type: 'legacy_award',
            description: 'Legacy SPA balance - Historical milestone rewards',
            status: 'completed',
            metadata: {
              retroactive: true,
              original_balance: user.spa_points,
              existing_tx_total: txTotal,
              created_reason: 'Fix missing transaction history for UI display',
              fix_timestamp: new Date().toISOString(),
              user_name: profile?.display_name
            }
          })
          .select()
          .single();

        if (insertError) {
          console.log('❌ Error creating transaction:', insertError.message);
          continue;
        }

        console.log('✅ Retroactive transaction created!');
        console.log(`   Transaction ID: ${newTx.id}`);
        console.log(`   Amount: +${newTx.amount} SPA`);

        // Step 4: Create notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.user_id,
            type: 'spa_award',
            title: '📊 Lịch sử SPA đã được cập nhật!',
            message: `Chúng tôi đã thêm lịch sử giao dịch cho ${gap} SPA của bạn. Giờ bạn có thể xem chi tiết trong tab SPA.`,
            icon: 'history',
            priority: 'medium',
            action_text: 'Xem SPA',
            action_url: '/profile?tab=spa',
            read: false,
            metadata: {
              transaction_id: newTx.id,
              retroactive_fix: true,
              amount: gap
            }
          });

        if (!notifError) {
          console.log('✅ Notification created');
        }

        console.log('\n🎉 SUCCESS! User can now see transaction history in UI');
        console.log(`   Expected: "${profile?.display_name}" will see transaction details instead of "Chưa có giao dịch SPA nào"`);
        
        return; // Stop after fixing first user
      } else {
        console.log(`   ✅ No fix needed\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findAndFixUser350().catch(console.error);
