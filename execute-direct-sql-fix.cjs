/**
 * DIRECT SQL EXECUTION - CREATE MISSING TRANSACTIONS
 * Execute từng step riêng biệt
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function executeDirectSqlFix() {
  console.log('🚀 DIRECT SQL EXECUTION FOR MISSING TRANSACTIONS');
  console.log('================================================\n');

  try {
    // Step 1: Find all users with gaps
    console.log('1. 🔍 Finding users with missing transactions...');
    
    const { data: gapUsers, error: gapError } = await supabase
      .from('player_rankings')
      .select(`
        user_id,
        spa_points,
        spa_transactions!inner(amount)
      `);

    if (gapError) {
      console.log('❌ Error finding gap users:', gapError.message);
      // Try simpler approach
      console.log('   📋 Trying direct query...');
      
      const { data: allUsers, error: allError } = await supabase
        .from('player_rankings')
        .select('user_id, spa_points')
        .gt('spa_points', 0);

      if (allError) {
        console.log('❌ Cannot get users:', allError.message);
        return;
      }

      console.log(`   ✅ Found ${allUsers.length} users with SPA > 0`);

      // Check each user for gaps
      const usersNeedingTransactions = [];
      
      for (const user of allUsers) {
        const { data: userTx } = await supabase
          .from('spa_transactions')
          .select('amount')
          .eq('user_id', user.user_id);

        const txTotal = userTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        const gap = user.spa_points - txTotal;
        
        if (gap > 0) {
          usersNeedingTransactions.push({
            user_id: user.user_id,
            spa_points: user.spa_points,
            transaction_total: txTotal,
            gap: gap
          });
        }
      }

      console.log(`   📊 Users needing transactions: ${usersNeedingTransactions.length}`);
      
      if (usersNeedingTransactions.length > 0) {
        console.log('   🏆 Top gaps:');
        usersNeedingTransactions
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 5)
          .forEach((user, i) => {
            console.log(`      ${i+1}. User ${user.user_id.substring(0, 8)}...: ${user.gap} SPA gap`);
          });
      }

      // Step 2: Create transactions for users with gaps
      console.log('\n2. 💾 Creating missing transaction records...');
      
      let created = 0;
      for (const user of usersNeedingTransactions) {
        try {
          // Check if this specific gap amount already has a legacy transaction
          const { data: existingLegacy } = await supabase
            .from('spa_transactions')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('source_type', 'legacy_award')
            .eq('amount', user.gap);

          if (!existingLegacy || existingLegacy.length === 0) {
            // Create the transaction
            const { error: insertError } = await supabase
              .from('spa_transactions')
              .insert({
                user_id: user.user_id,
                amount: user.gap,
                transaction_type: 'credit',
                source_type: 'legacy_award',
                description: 'Legacy SPA balance - Historical milestone and rank rewards',
                status: 'completed',
                metadata: {
                  retroactive: true,
                  original_spa_balance: user.spa_points,
                  existing_transaction_total: user.transaction_total,
                  created_reason: 'Direct fix for missing transaction history',
                  fix_timestamp: new Date().toISOString(),
                  batch_operation: true
                }
              });

            if (insertError) {
              console.log(`   ❌ Failed to create transaction for user ${user.user_id.substring(0, 8)}...: ${insertError.message}`);
            } else {
              created++;
              
              // Create notification for large amounts
              if (user.gap >= 100) {
                await supabase
                  .from('notifications')
                  .insert({
                    user_id: user.user_id,
                    title: 'SPA Transaction History Updated',
                    message: `Your SPA transaction history has been updated with historical milestone rewards (${user.gap} SPA).`,
                    type: 'spa_award',
                    read: false,
                    metadata: {
                      spa_amount: user.gap,
                      retroactive_award: true,
                      created_by_system: true
                    }
                  });
              }
            }
          } else {
            console.log(`   ⚠️  User ${user.user_id.substring(0, 8)}... already has legacy transaction for ${user.gap} SPA`);
          }
        } catch (userError) {
          console.log(`   ❌ Error processing user ${user.user_id.substring(0, 8)}...: ${userError.message}`);
        }
      }

      console.log(`   ✅ Created ${created} new transaction records`);

      // Step 3: Verify results
      console.log('\n3. ✅ Verifying fix...');
      
      const { data: totalLegacyTx } = await supabase
        .from('spa_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('source_type', 'legacy_award');

      console.log(`   📊 Total legacy transactions: ${totalLegacyTx || 0}`);

      // Check a few users again
      console.log('\n4. 🧪 Spot checking results...');
      
      for (const user of usersNeedingTransactions.slice(0, 3)) {
        const { data: newUserTx } = await supabase
          .from('spa_transactions')
          .select('amount')
          .eq('user_id', user.user_id);

        const newTxTotal = newUserTx?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        const newGap = user.spa_points - newTxTotal;
        
        console.log(`   👤 User ${user.user_id.substring(0, 8)}...: ${newGap === 0 ? '✅ Perfect' : '⚠️ Gap: ' + newGap}`);
      }

      console.log('\n🎉 DIRECT SQL FIX COMPLETE!');
      console.log('============================');
      console.log(`✅ Created ${created} missing transaction records`);
      console.log('✅ Users should now see complete transaction history in UI');
    }

  } catch (error) {
    console.error('❌ Direct SQL fix failed:', error);
  }
}

executeDirectSqlFix().catch(console.error);
