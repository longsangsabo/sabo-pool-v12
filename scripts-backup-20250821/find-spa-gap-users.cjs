/**
 * CHECK SPECIFIC USER SPA vs TRANSACTION MISMATCH
 * Tìm user có SPA nhưng thiếu transaction records
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function findUserWithSpaGap() {
  console.log('🔍 FINDING USERS WITH SPA vs TRANSACTION GAPS');
  console.log('==============================================\n');

  try {
    // Step 1: Get users with SPA > 0
    console.log('1. 👥 Getting users with SPA...');
    
    const { data: usersWithSpa, error: usersError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points, updated_at')
      .gt('spa_points', 0)
      .order('spa_points', { ascending: false })
      .limit(10);

    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
      return;
    }

    console.log(`✅ Found ${usersWithSpa.length} users with highest SPA\n`);

    // Step 2: For each user, check their transaction total
    for (const user of usersWithSpa) {
      console.log(`👤 User ID: ${user.user_id.substring(0, 8)}...`);
      console.log(`   Current SPA: ${user.spa_points}`);
      console.log(`   Last updated: ${new Date(user.updated_at).toLocaleString()}`);

      // Get user's display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.user_id)
        .single();

      if (profile) {
        console.log(`   Name: ${profile.display_name}`);
      }

      // Check spa_transactions for this user
      const { data: transactions, error: txError } = await supabase
        .from('spa_transactions')
        .select('amount, description, created_at, source_type')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (txError) {
        console.log(`   ❌ Transaction error: ${txError.message}`);
        continue;
      }

      const transactionTotal = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const gap = user.spa_points - transactionTotal;

      console.log(`   📊 Transaction records: ${transactions?.length || 0}`);
      console.log(`   💰 Transaction total: ${transactionTotal} SPA`);
      
      if (gap > 0) {
        console.log(`   🚨 GAP FOUND: ${gap} SPA unaccounted!`);
        console.log('   📋 Recent transactions:');
        transactions?.slice(0, 3).forEach((tx, i) => {
          console.log(`      ${i+1}. +${tx.amount} SPA from ${tx.source_type} - ${tx.description}`);
        });
        
        // This user needs retroactive transaction record
        console.log(`   💡 Needs retroactive record for ${gap} SPA`);
      } else if (gap === 0) {
        console.log(`   ✅ Perfect balance - all SPA accounted for`);
      } else {
        console.log(`   ⚠️  Negative gap: ${gap} (transaction total > SPA balance)`);
      }

      console.log('');
      
      // Focus on user with 350 SPA specifically
      if (user.spa_points === 350) {
        console.log('🎯 FOUND USER WITH 350 SPA!');
        console.log('   This is likely the user from the screenshot.');
        console.log('   Processing this user specifically...\n');
        
        return {
          user_id: user.user_id,
          display_name: profile?.display_name,
          current_spa: user.spa_points,
          transaction_total: transactionTotal,
          gap: gap,
          transactions: transactions
        };
      }
    }

    // Step 3: Find users with biggest gaps
    console.log('📊 SUMMARY OF GAPS:');
    console.log('-'.repeat(20));
    
    let totalGap = 0;
    let usersWithGaps = 0;
    
    for (const user of usersWithSpa) {
      const { data: transactions } = await supabase
        .from('spa_transactions')
        .select('amount')
        .eq('user_id', user.user_id);
      
      const transactionTotal = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const gap = user.spa_points - transactionTotal;
      
      if (gap > 0) {
        totalGap += gap;
        usersWithGaps++;
      }
    }
    
    console.log(`📈 Users with gaps: ${usersWithGaps}/${usersWithSpa.length}`);
    console.log(`💰 Total missing SPA: ${totalGap}`);
    
    if (usersWithGaps > 0) {
      console.log('\n🔧 SOLUTION:');
      console.log('Run the retroactive script to create missing transaction records.');
    } else {
      console.log('\n✅ No gaps found in top users - transaction history is complete!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findUserWithSpaGap().catch(console.error);
