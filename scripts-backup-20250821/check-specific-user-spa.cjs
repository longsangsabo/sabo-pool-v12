// ============================================================================
// CHECK SPECIFIC USER SPA STATUS
// ============================================================================
// Purpose: Check specific user SPA status after retroactive script
// ============================================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUserSpaStatus() {
  console.log('🔍 CHECKING USER SPA STATUS FOR: lss2ps@gmail.com');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Get user basic info
    console.log('1. 👤 USER BASIC INFO:');
    
    // First try to get user ID directly from public data
    const { data: rankings, error: rankingsError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points, created_at, updated_at')
      .limit(100); // Get multiple users to find our target
    
    if (rankingsError) {
      console.log('❌ Rankings Error:', rankingsError.message);
      return;
    }

    // Since we can't access auth.users directly with ANON key, 
    // let's focus on what we can access with available data
    console.log(`   ℹ️  Found ${rankings.length} users in player_rankings`);
    console.log('   📧 Looking for user by pattern matching...');
    console.log('');

    // 2. Check player_rankings (SPA points)
    console.log('2. 💰 PLAYER RANKINGS & SPA:');
    const { data: ranking, error: rankingError } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (rankingError) {
      console.log('❌ Ranking Error:', rankingError.message);
    } else if (ranking) {
      console.log(`   ✅ Current SPA: ${ranking.spa_points || 0}`);
      console.log(`   ✅ Ranking created: ${new Date(ranking.created_at).toLocaleString()}`);
      console.log(`   ✅ Last updated: ${new Date(ranking.updated_at).toLocaleString()}`);
    } else {
      console.log('   ❌ No ranking record found');
    }
    console.log('');

    // 3. Check milestone progress
    console.log('3. 🏆 MILESTONE PROGRESS:');
    const { data: milestones, error: milestoneError } = await supabase
      .from('player_milestones')
      .select(`
        *,
        milestones:milestone_id (
          name,
          milestone_type,
          spa_reward,
          requirement_value
        )
      `)
      .eq('player_id', userId);

    if (milestoneError) {
      console.log('❌ Milestone Error:', milestoneError.message);
    } else if (milestones && milestones.length > 0) {
      console.log(`   ✅ Found ${milestones.length} milestone(s):`);
      milestones.forEach((milestone, index) => {
        console.log(`   ${index + 1}. ${milestone.milestones.name}`);
        console.log(`      Type: ${milestone.milestones.milestone_type}`);
        console.log(`      SPA Reward: ${milestone.milestones.spa_reward}`);
        console.log(`      Progress: ${milestone.current_progress}/${milestone.milestones.requirement_value}`);
        console.log(`      Completed: ${milestone.is_completed ? '✅ Yes' : '❌ No'}`);
        console.log(`      Completed at: ${milestone.completed_at ? new Date(milestone.completed_at).toLocaleString() : 'N/A'}`);
        console.log(`      Times completed: ${milestone.times_completed}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No milestone progress found');
    }
    console.log('');

    // 4. Check SPA transaction history
    console.log('4. 📊 SPA TRANSACTION HISTORY:');
    const { data: transactions, error: transactionError } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (transactionError) {
      console.log('❌ Transaction Error:', transactionError.message);
    } else if (transactions && transactions.length > 0) {
      console.log(`   ✅ Found ${transactions.length} transaction(s):`);
      transactions.forEach((tx, index) => {
        console.log(`   ${index + 1}. ${tx.transaction_type} - ${tx.amount > 0 ? '+' : ''}${tx.amount} SPA`);
        console.log(`      Description: ${tx.description}`);
        console.log(`      Date: ${new Date(tx.created_at).toLocaleString()}`);
        if (tx.reference_id) {
          console.log(`      Reference: ${tx.reference_id}`);
        }
        console.log('');
      });
    } else {
      console.log('   ❌ No SPA transactions found');
    }
    console.log('');

    // 5. Check notifications
    console.log('5. 🔔 RECENT NOTIFICATIONS:');
    const { data: notifications, error: notificationError } = await supabase
      .from('challenge_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (notificationError) {
      console.log('❌ Notification Error:', notificationError.message);
    } else if (notifications && notifications.length > 0) {
      console.log(`   ✅ Found ${notifications.length} recent notification(s):`);
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.type} - ${notif.title}`);
        console.log(`      Message: ${notif.message}`);
        console.log(`      Date: ${new Date(notif.created_at).toLocaleString()}`);
        console.log(`      Read: ${notif.is_read ? '✅ Yes' : '❌ No'}`);
        if (notif.metadata) {
          console.log(`      Metadata: ${JSON.stringify(notif.metadata, null, 2)}`);
        }
        console.log('');
      });
    } else {
      console.log('   ❌ No notifications found');
    }
    console.log('');

    // 6. Check if user was eligible for retroactive awards
    console.log('6. 🎯 RETROACTIVE AWARD ELIGIBILITY:');
    
    // Check if user existed before milestone system
    const { data: allMilestones, error: allMilestonesError } = await supabase
      .from('milestones')
      .select('*')
      .in('milestone_type', ['account_creation', 'rank_registration'])
      .eq('is_active', true);

    if (allMilestonesError) {
      console.log('❌ Milestones Error:', allMilestonesError.message);
    } else {
      console.log(`   ✅ Available milestones:`);
      allMilestones.forEach(milestone => {
        console.log(`      - ${milestone.name} (${milestone.milestone_type}): ${milestone.spa_reward} SPA`);
      });
      
      console.log('');
      console.log(`   🔍 Eligibility check:`);
      console.log(`      - Has ranking record: ${ranking ? '✅ Yes' : '❌ No'}`);
      console.log(`      - Should get account_creation: ✅ Yes (all users)`);
      console.log(`      - Should get rank_registration: ${ranking ? '✅ Yes' : '❌ No'}`);
      
      const expectedSpa = allMilestones.reduce((total, milestone) => {
        if (milestone.milestone_type === 'account_creation') return total + milestone.spa_reward;
        if (milestone.milestone_type === 'rank_registration' && ranking) return total + milestone.spa_reward;
        return total;
      }, 0);
      
      console.log(`      - Expected total SPA from milestones: ${expectedSpa}`);
      console.log(`      - Current SPA: ${ranking?.spa_points || 0}`);
      console.log(`      - Difference: ${(ranking?.spa_points || 0) - expectedSpa}`);
    }

    console.log('');
    console.log('🏁 ANALYSIS COMPLETE');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUserSpaStatus();
