const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpaVsMilestones() {
  try {
    console.log('=== KIỂM TRA SPA TRANSACTIONS VS MILESTONES ===');

    // 1. Count completed milestones
    const { data: completedMilestones } = await supabase
      .from('player_milestones')
      .select('*, milestones(spa_reward)')
      .eq('is_completed', true);

    console.log(`\n📊 Completed milestones: ${completedMilestones?.length || 0}`);
    
    let totalExpectedSpa = 0;
    completedMilestones?.forEach(cm => {
      totalExpectedSpa += cm.milestones?.spa_reward || 0;
    });
    console.log(`💰 Total expected SPA from milestones: ${totalExpectedSpa} SPA`);

    // 2. Count milestone SPA transactions
    const { data: milestoneTransactions } = await supabase
      .from('spa_transactions')
      .select('amount')
      .eq('source_type', 'milestone_reward');

    console.log(`\n💳 Milestone SPA transactions: ${milestoneTransactions?.length || 0}`);
    
    let totalTransactionSpa = 0;
    milestoneTransactions?.forEach(mt => {
      totalTransactionSpa += mt.amount || 0;
    });
    console.log(`💰 Total SPA from milestone transactions: ${totalTransactionSpa} SPA`);

    // 3. The gap
    console.log(`\n🔍 ANALYSIS:`);
    console.log(`   Expected SPA: ${totalExpectedSpa}`);
    console.log(`   Actual SPA: ${totalTransactionSpa}`);
    console.log(`   Missing SPA: ${totalExpectedSpa - totalTransactionSpa}`);

    // 4. Check sample user
    const { data: sampleUser } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .limit(1)
      .single();

    if (sampleUser) {
      console.log(`\n👤 Sample user: ${sampleUser.display_name}`);
      
      // Their milestones
      const { data: userMilestones } = await supabase
        .from('player_milestones')
        .select('*, milestones(name, spa_reward)')
        .eq('player_id', sampleUser.user_id)
        .eq('is_completed', true);

      console.log(`   Completed milestones: ${userMilestones?.length || 0}`);
      let userExpectedSpa = 0;
      userMilestones?.forEach(um => {
        userExpectedSpa += um.milestones?.spa_reward || 0;
        console.log(`     - ${um.milestones?.name}: ${um.milestones?.spa_reward} SPA`);
      });

      // Their SPA transactions
      const { data: userTransactions } = await supabase
        .from('spa_transactions')
        .select('amount, description')
        .eq('user_id', sampleUser.user_id)
        .eq('source_type', 'milestone_reward');

      console.log(`   Milestone transactions: ${userTransactions?.length || 0}`);
      let userActualSpa = 0;
      userTransactions?.forEach(ut => {
        userActualSpa += ut.amount || 0;
        console.log(`     - ${ut.description}: ${ut.amount} SPA`);
      });

      console.log(`   Expected: ${userExpectedSpa} SPA vs Actual: ${userActualSpa} SPA`);
      console.log(`   Gap: ${userExpectedSpa - userActualSpa} SPA`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSpaVsMilestones();
