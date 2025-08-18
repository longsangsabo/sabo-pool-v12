const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllUsersMilestones() {
  try {
    console.log('=== KIỂM TRA MILESTONE TẤT CẢ USERS ===\n');

    // Get all users
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
      return;
    }

    console.log(`👥 Found ${allUsers.length} users in system`);
    console.log('=' * 60);

    // Check account_creation milestone status for all users
    const { data: accountMilestone } = await supabase
      .from('milestones')
      .select('*')
      .eq('milestone_type', 'account_creation')
      .single();

    if (!accountMilestone) {
      console.log('❌ Account creation milestone not found');
      return;
    }

    console.log(`🏆 Checking milestone: "${accountMilestone.name}" (${accountMilestone.spa_reward} SPA)\n`);

    let usersWithMilestone = 0;
    let usersWithoutMilestone = 0;
    let usersWithSpaBalance = 0;
    let usersWithoutSpaBalance = 0;
    let usersNeedingFix = [];

    for (const user of allUsers) {
      const userId = user.user_id;
      const userName = user.full_name || 'Unknown';
      
      // Check if user has completed account_creation milestone
      const { data: milestoneProgress } = await supabase
        .from('player_milestones')
        .select('is_completed, completed_at')
        .eq('player_id', userId)
        .eq('milestone_id', accountMilestone.id)
        .single();

      // Check current SPA balance
      const { data: balance } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      const currentSpa = balance?.spa_points || 0;
      const hasMilestone = milestoneProgress?.is_completed || false;

      // Count stats
      if (hasMilestone) {
        usersWithMilestone++;
      } else {
        usersWithoutMilestone++;
      }

      if (currentSpa > 0) {
        usersWithSpaBalance++;
      } else {
        usersWithoutSpaBalance++;
      }

      // Determine if user needs fixing
      const needsFix = !hasMilestone && currentSpa === 0;
      if (needsFix) {
        usersNeedingFix.push({
          user_id: userId,
          name: userName,
          created_at: user.created_at,
          spa_balance: currentSpa,
          has_milestone: hasMilestone
        });
      }

      // Display user status
      const statusIcon = needsFix ? '❌' : (hasMilestone ? '✅' : '⚠️');
      console.log(`${statusIcon} ${userName.padEnd(20)} | SPA: ${currentSpa.toString().padStart(4)} | Milestone: ${hasMilestone ? 'YES' : 'NO'} | Created: ${user.created_at.substring(0,10)}`);
    }

    console.log('\n' + '=' * 60);
    console.log('📊 SUMMARY STATISTICS:');
    console.log(`👥 Total users: ${allUsers.length}`);
    console.log(`✅ Users with account_creation milestone: ${usersWithMilestone}`);
    console.log(`❌ Users without account_creation milestone: ${usersWithoutMilestone}`);
    console.log(`💰 Users with SPA balance > 0: ${usersWithSpaBalance}`);
    console.log(`💸 Users with SPA balance = 0: ${usersWithoutSpaBalance}`);
    console.log(`🔧 Users needing milestone fix: ${usersNeedingFix.length}`);

    if (usersNeedingFix.length > 0) {
      console.log('\n🚨 USERS NEEDING ACCOUNT_CREATION MILESTONE FIX:');
      console.log('=' * 60);
      usersNeedingFix.forEach((user, i) => {
        console.log(`${i+1}. ${user.name} (${user.user_id.substring(0,8)}...)`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Current SPA: ${user.spa_balance}`);
        console.log(`   Has milestone: ${user.has_milestone}`);
        console.log('');
      });

      console.log('💡 RECOMMENDED ACTION:');
      console.log('Run mass milestone fix for all users without account_creation milestone');
      console.log('This will award 100 SPA to each affected user');
      console.log('');
      console.log('📝 TO FIX ALL USERS:');
      console.log('1. Create mass-fix-account-milestones.cjs script');
      console.log('2. Loop through usersNeedingFix array');
      console.log('3. Apply same fix as done for user Sang');
      console.log('4. Verify results');
    } else {
      console.log('\n🎉 ALL USERS HAVE PROPER ACCOUNT_CREATION MILESTONE!');
    }

    // Check for other potential milestone gaps
    console.log('\n🔍 CHECKING OTHER MILESTONE GAPS...');
    
    // Get users who should have rank_registration milestone
    const { data: usersWithRank } = await supabase
      .from('rank_requests')
      .select('user_id, status')
      .eq('status', 'approved');

    if (usersWithRank && usersWithRank.length > 0) {
      console.log(`📊 Found ${usersWithRank.length} users with approved rank requests`);
      
      const { data: rankMilestone } = await supabase
        .from('milestones')
        .select('*')
        .eq('milestone_type', 'rank_registration')
        .single();

      if (rankMilestone) {
        let usersWithRankMilestone = 0;
        let usersWithoutRankMilestone = 0;

        for (const rankUser of usersWithRank) {
          const { data: rankProgress } = await supabase
            .from('player_milestones')
            .select('is_completed')
            .eq('player_id', rankUser.user_id)
            .eq('milestone_id', rankMilestone.id)
            .single();

          if (rankProgress?.is_completed) {
            usersWithRankMilestone++;
          } else {
            usersWithoutRankMilestone++;
          }
        }

        console.log(`✅ Users with rank_registration milestone: ${usersWithRankMilestone}`);
        console.log(`❌ Users without rank_registration milestone: ${usersWithoutRankMilestone}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllUsersMilestones();
