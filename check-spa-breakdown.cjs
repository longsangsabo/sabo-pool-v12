// ============================================================================
// DETAILED SPA BREAKDOWN FOR SPECIFIC USER
// ============================================================================
// Purpose: Check exact SPA breakdown for lss2ps@gmail.com
// ============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserSpaBreakdown() {
  console.log('🔍 DETAILED SPA BREAKDOWN FOR: lss2ps@gmail.com');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Get user ID
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }

    const targetUser = authUsers.users.find(user => user.email === 'lss2ps@gmail.com');
    
    if (!targetUser) {
      console.log('❌ User not found');
      return;
    }

    const userId = targetUser.id;
    console.log(`✅ User ID: ${userId}`);
    console.log('');

    // 2. Check current SPA balance
    const { data: currentRanking, error: rankError } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (rankError) {
      console.log('❌ Ranking error:', rankError.message);
      return;
    }

    console.log('💰 CURRENT SPA BALANCE:');
    console.log(`   Current SPA: ${currentRanking.spa_points}`);
    console.log(`   Last Updated: ${new Date(currentRanking.updated_at).toLocaleString()}`);
    console.log('');

    // 3. Get ALL SPA transactions for this user
    const { data: allTransactions, error: txError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    console.log('📊 ALL SPA TRANSACTIONS:');
    if (txError) {
      console.log('❌ Transaction error:', txError.message);
    } else if (allTransactions.length > 0) {
      let runningTotal = 0;
      console.log(`   ✅ Found ${allTransactions.length} transaction(s):`);
      allTransactions.forEach((tx, i) => {
        runningTotal += tx.amount;
        console.log(`   ${i+1}. ${new Date(tx.created_at).toLocaleString()}`);
        console.log(`      Type: ${tx.transaction_type} | Source: ${tx.source_type || 'N/A'}`);
        console.log(`      Amount: ${tx.amount > 0 ? '+' : ''}${tx.amount} SPA`);
        console.log(`      Description: ${tx.description}`);
        console.log(`      Status: ${tx.status || 'N/A'}`);
        console.log(`      Running Total: ${runningTotal} SPA`);
        console.log('');
      });
      
      console.log(`📈 TRANSACTION SUMMARY:`);
      console.log(`   Total from transactions: ${runningTotal} SPA`);
      console.log(`   Current balance: ${currentRanking.spa_points} SPA`);
      console.log(`   Difference: ${currentRanking.spa_points - runningTotal} SPA`);
      
      if (currentRanking.spa_points !== runningTotal) {
        console.log('   ⚠️  SPA MISMATCH! Balance doesn\'t match transaction sum');
        console.log('   🔍 This suggests SPA was added outside of spa_transactions table');
      }
    } else {
      console.log('   ❌ No transactions found in spa_transactions table');
      console.log('   🔍 This means SPA was added directly to player_rankings');
    }
    console.log('');

    // 4. Check milestone rewards that SHOULD have been awarded
    const { data: userMilestones, error: milestoneError } = await supabase
      .from('player_milestones')
      .select(`
        *,
        milestones:milestone_id (
          name,
          milestone_type,
          spa_reward
        )
      `)
      .eq('player_id', userId)
      .eq('is_completed', true);

    console.log('🏆 MILESTONE REWARDS:');
    if (milestoneError) {
      console.log('❌ Milestone error:', milestoneError.message);
    } else if (userMilestones.length > 0) {
      let totalMilestoneSpa = 0;
      console.log(`   ✅ Found ${userMilestones.length} completed milestone(s):`);
      userMilestones.forEach((milestone, i) => {
        totalMilestoneSpa += milestone.milestones.spa_reward;
        console.log(`   ${i+1}. ${milestone.milestones.name}`);
        console.log(`      Type: ${milestone.milestones.milestone_type}`);
        console.log(`      SPA Reward: ${milestone.milestones.spa_reward}`);
        console.log(`      Completed: ${new Date(milestone.completed_at).toLocaleString()}`);
        console.log('');
      });
      
      console.log(`📈 MILESTONE SUMMARY:`);
      console.log(`   Expected SPA from milestones: ${totalMilestoneSpa} SPA`);
      console.log(`   Current SPA balance: ${currentRanking.spa_points} SPA`);
      console.log(`   SPA from other sources: ${currentRanking.spa_points - totalMilestoneSpa} SPA`);
    } else {
      console.log('   ❌ No completed milestones found');
    }
    console.log('');

    // 5. Check recent ranking updates
    console.log('🕐 RECENT PLAYER_RANKINGS HISTORY:');
    console.log(`   Created: ${new Date(currentRanking.created_at).toLocaleString()}`);
    console.log(`   Updated: ${new Date(currentRanking.updated_at).toLocaleString()}`);
    console.log('');

    // 6. Summary analysis
    console.log('🔍 ANALYSIS:');
    if (allTransactions.length === 0) {
      console.log('   📋 No transactions in spa_transactions table');
      console.log('   💡 SPA was likely added directly to player_rankings');
      console.log('   🎯 Current 303 SPA might be from:');
      console.log('      - Code rewards (300 SPA)');
      console.log('      - Manual admin additions');
      console.log('      - Test function calls (+1 or +3 SPA)');
      console.log('      - Direct database updates');
    } else {
      const transactionTotal = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      if (currentRanking.spa_points > transactionTotal) {
        console.log('   📋 Some SPA added outside transaction system');
        console.log(`   💡 ${currentRanking.spa_points - transactionTotal} SPA from unknown source`);
      }
    }

    console.log('');
    console.log('🏁 SPA BREAKDOWN ANALYSIS COMPLETE');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUserSpaBreakdown();
