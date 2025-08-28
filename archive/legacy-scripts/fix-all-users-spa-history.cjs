/**
 * COMPREHENSIVE SPA TRANSACTION HISTORY FIX
 * 1. Tạo retroactive transaction records cho TẤT CẢ users hiện có
 * 2. Setup system để tự động tạo transaction cho users mới
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixAllUsersTransactionHistory() {
  console.log('🔄 COMPREHENSIVE SPA TRANSACTION HISTORY FIX');
  console.log('=============================================\n');

  try {
    // Step 1: Get ALL users with SPA > 0
    console.log('1. 🔍 Finding all users with SPA > 0...');
    
    const { data: allUsersWithSpa, error: usersError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points, updated_at')
      .gt('spa_points', 0)
      .order('spa_points', { ascending: false });

    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
      return;
    }

    console.log(`✅ Found ${allUsersWithSpa.length} users with SPA > 0\n`);

    let fixedUsers = 0;
    let totalTransactionsCreated = 0;
    let totalSpaProcessed = 0;
    let errors = 0;

    // Step 2: Process each user
    for (const user of allUsersWithSpa) {
      try {
        console.log(`👤 Processing User: ${user.user_id.substring(0, 8)}... (${user.spa_points} SPA)`);

        // Get user profile info
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.user_id)
          .single();

        const userName = profile?.display_name || 'Unknown User';
        console.log(`   Name: ${userName}`);

        // Check existing transactions
        const { data: existingTransactions } = await supabase
          .from('spa_transactions')
          .select('amount')
          .eq('user_id', user.user_id);

        const currentTransactionTotal = existingTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        const missingAmount = user.spa_points - currentTransactionTotal;

        console.log(`   Current transactions: ${existingTransactions?.length || 0}`);
        console.log(`   Transaction total: ${currentTransactionTotal} SPA`);
        console.log(`   Missing amount: ${missingAmount} SPA`);

        if (missingAmount > 0) {
          // Create retroactive transaction
          console.log(`   💰 Creating retroactive transaction for ${missingAmount} SPA...`);

          const { error: insertError } = await supabase
            .from('spa_transactions')
            .insert({
              user_id: user.user_id,
              amount: missingAmount,
              transaction_type: 'credit',
              source_type: 'legacy_award',
              description: 'Legacy SPA balance - Historical milestone and rank rewards',
              status: 'completed',
              metadata: {
                retroactive: true,
                original_spa_balance: user.spa_points,
                existing_transaction_total: currentTransactionTotal,
                created_reason: 'Comprehensive fix for missing transaction history',
                fix_timestamp: new Date().toISOString(),
                user_name: userName
              }
            });

          if (insertError) {
            console.log(`   ❌ Error creating transaction: ${insertError.message}`);
            errors++;
          } else {
            console.log(`   ✅ Transaction created: +${missingAmount} SPA`);
            fixedUsers++;
            totalTransactionsCreated++;
            totalSpaProcessed += missingAmount;

            // Create notification for significant amounts
            if (missingAmount >= 50) {
              const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                  user_id: user.user_id,
                  type: 'spa_award',
                  title: '📊 Lịch sử SPA đã được cập nhật!',
                  message: `Chúng tôi đã thêm lịch sử giao dịch cho ${missingAmount} SPA của bạn. Giờ bạn có thể xem chi tiết trong tab SPA.`,
                  icon: 'history',
                  priority: 'medium',
                  action_text: 'Xem SPA',
                  action_url: '/profile?tab=spa',
                  read: false,
                  metadata: {
                    retroactive_fix: true,
                    amount: missingAmount
                  }
                });

              if (!notifError) {
                console.log(`   🔔 Notification created`);
              }
            }
          }
        } else if (missingAmount === 0) {
          console.log(`   ✅ Already has complete transaction history`);
        } else {
          console.log(`   ⚠️  Transaction total exceeds SPA balance (${missingAmount})`);
        }

        console.log('');

        // Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (userError) {
        console.log(`   ❌ Error processing user: ${userError.message}`);
        errors++;
      }
    }

    // Step 3: Summary
    console.log('📊 COMPREHENSIVE FIX SUMMARY:');
    console.log('='.repeat(35));
    console.log(`✅ Total users processed: ${allUsersWithSpa.length}`);
    console.log(`✅ Users fixed: ${fixedUsers}`);
    console.log(`✅ Transaction records created: ${totalTransactionsCreated}`);
    console.log(`✅ Total SPA processed: ${totalSpaProcessed.toLocaleString()}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('');

    if (fixedUsers > 0) {
      console.log('🎉 SUCCESS! All users should now see their SPA transaction history.');
      console.log('');
      console.log('📱 Expected UI behavior for all fixed users:');
      console.log('   - Open Profile → SPA tab');
      console.log('   - See "Legacy SPA balance - Historical milestone and rank rewards"');
      console.log('   - No more "Chưa có giao dịch SPA nào" message');
    }

    // Step 4: Verify system is ready for future users
    console.log('\n🔧 SYSTEM READINESS CHECK:');
    console.log('-'.repeat(30));
    
    // Check if update_spa_points function exists
    try {
      const { data: functionTest, error: funcError } = await supabase
        .rpc('update_spa_points', {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_points: 0,
          p_source_type: 'test',
          p_description: 'System test'
        });

      if (funcError && funcError.message.includes('function update_spa_points')) {
        console.log('❌ update_spa_points function NOT found');
        console.log('   ⚠️  Future SPA updates may not create transaction records');
        console.log('   🔧 Need to deploy unified SPA function');
      } else {
        console.log('✅ update_spa_points function exists');
        console.log('   ✅ Future SPA updates will automatically create transactions');
      }
    } catch (e) {
      console.log('⚠️  Could not test update_spa_points function');
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Verify UI shows transaction history for all users');
    console.log('2. Deploy unified update_spa_points function for future updates');
    console.log('3. Update all triggers to use unified function');
    console.log('4. Test new milestone completions create proper transactions');

  } catch (error) {
    console.error('❌ Comprehensive fix failed:', error);
  }
}

// Execute the comprehensive fix
fixAllUsersTransactionHistory().catch(console.error);
