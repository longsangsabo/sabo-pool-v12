/**
 * CREATE RETROACTIVE SPA TRANSACTION RECORDS
 * Tạo transaction history cho tất cả SPA hiện có mà thiếu transaction records
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createRetroactiveSpaTransactions() {
  console.log('🔄 CREATING RETROACTIVE SPA TRANSACTION RECORDS');
  console.log('===============================================\n');

  try {
    // Step 1: Find users with SPA but missing transaction records
    console.log('1. 🔍 Finding users with SPA > 0...');
    
    // Get all users with SPA points
    const { data: usersWithSpa, error: usersError } = await supabase
      .from('player_rankings')
      .select(`
        user_id,
        spa_points,
        updated_at,
        profiles!inner(display_name, created_at)
      `)
      .gt('spa_points', 0);

    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
      return;
    }

    console.log(`✅ Found ${usersWithSpa.length} users with SPA > 0\n`);

    let transactionsCreated = 0;
    let errors = 0;

    // Step 2: For each user, check if they have corresponding transaction records
    for (const user of usersWithSpa) {
      console.log(`👤 Processing: ${user.profiles.display_name} (${user.spa_points} SPA)`);

      // Check existing transactions
      const { data: existingTransactions, error: txError } = await supabase
        .from('spa_transactions')
        .select('amount')
        .eq('user_id', user.user_id);

      if (txError) {
        console.log(`   ❌ Error checking transactions: ${txError.message}`);
        errors++;
        continue;
      }

      const transactionTotal = existingTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const missingAmount = user.spa_points - transactionTotal;

      console.log(`   Current SPA: ${user.spa_points}`);
      console.log(`   Transaction Total: ${transactionTotal}`);
      console.log(`   Missing: ${missingAmount} SPA`);

      // If there's missing SPA, create retroactive transaction
      if (missingAmount > 0) {
        // Check if user has milestone completions to explain the SPA
        const { data: milestones } = await supabase
          .from('player_milestones')
          .select(`
            milestone_id,
            completed_at,
            milestones!inner(name, spa_reward)
          `)
          .eq('player_id', user.user_id)
          .eq('is_completed', true);

        let description = 'Legacy SPA balance - Historical completion';
        let source_type = 'legacy_award';
        
        if (milestones && milestones.length > 0) {
          description = `Legacy milestones: ${milestones.map(m => m.milestones.name).join(', ')}`;
          source_type = 'milestone_award';
        }

        // Create retroactive transaction
        const { error: insertError } = await supabase
          .from('spa_transactions')
          .insert({
            user_id: user.user_id,
            amount: missingAmount,
            transaction_type: 'credit',
            source_type,
            description,
            status: 'completed',
            reference_id: null,
            metadata: {
              retroactive: true,
              original_balance: user.spa_points,
              transaction_total: transactionTotal,
              created_reason: 'Fix missing transaction history'
            }
          });

        if (insertError) {
          console.log(`   ❌ Error creating transaction: ${insertError.message}`);
          errors++;
        } else {
          console.log(`   ✅ Created retroactive transaction: +${missingAmount} SPA`);
          transactionsCreated++;
        }
      } else if (missingAmount === 0) {
        console.log(`   ✅ Already has complete transaction history`);
      } else {
        console.log(`   ⚠️  Transaction total exceeds SPA balance (${missingAmount})`);
      }
      console.log('');
    }

    // Step 3: Summary
    console.log('📊 SUMMARY:');
    console.log(`✅ Users processed: ${usersWithSpa.length}`);
    console.log(`✅ Transactions created: ${transactionsCreated}`);
    console.log(`❌ Errors: ${errors}`);
    
    if (transactionsCreated > 0) {
      console.log('\n🎉 SUCCESS! Retroactive transaction records created.');
      console.log('   Users should now see their SPA transaction history in the UI.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createRetroactiveSpaTransactions().catch(console.error);
