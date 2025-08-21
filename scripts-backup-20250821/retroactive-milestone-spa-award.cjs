const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function retroactivelyAwardMilestones() {
  console.log('🔄 RETROACTIVE MILESTONE SPA AWARD SYSTEM');
  console.log('==========================================');
  console.log('');
  console.log('🎯 PURPOSE: Award SPA to users created before milestone system');
  console.log('');

  try {
    console.log('1. 📊 ANALYZING USERS WITHOUT MILESTONE PROGRESS...');
    
    // First, get all users with milestone progress
    const { data: usersWithMilestones, error: withMilestonesError } = await supabase
      .from('player_milestones')
      .select('player_id')
      .not('player_id', 'is', null);

    if (withMilestonesError) {
      console.log('❌ Error fetching users with milestones:', withMilestonesError.message);
      return;
    }

    const userIdsWithMilestones = usersWithMilestones?.map(p => p.player_id) || [];
    console.log(`📋 Found ${userIdsWithMilestones.length} users with existing milestone progress`);

    // Now get all users who DON'T have milestone progress
    let usersWithoutMilestones;
    if (userIdsWithMilestones.length === 0) {
      // No users have milestones yet, get all users
      const { data, error } = await supabase
        .from('player_rankings')
        .select('user_id, spa_points, created_at');
      
      if (error) {
        console.log('❌ Error fetching all users:', error.message);
        return;
      }
      usersWithoutMilestones = data;
    } else {
      // Get users not in the milestone list
      const { data, error } = await supabase
        .from('player_rankings')
        .select('user_id, spa_points, created_at')
        .not('user_id', 'in', `(${userIdsWithMilestones.map(id => `'${id}'`).join(',')})`);
      
      if (error) {
        console.log('❌ Error fetching users without milestones:', error.message);
        return;
      }
      usersWithoutMilestones = data;
    }

    console.log(`📋 Found ${usersWithoutMilestones?.length || 0} users without milestone progress`);

    if (!usersWithoutMilestones || usersWithoutMilestones.length === 0) {
      console.log('✅ All users already have milestone progress records!');
      console.log('No retroactive awards needed.');
      return;
    }

    console.log('');
    console.log('2. 🎯 GETTING AVAILABLE MILESTONES...');

    // Get all active milestones that should be awarded retroactively
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('is_active', true)
      .in('milestone_type', [
        'account_creation',      // Should get this for having account
        'rank_registration'      // Should get this if they have ranking record
      ])
      .order('spa_reward', { ascending: true });

    if (milestonesError) {
      console.log('❌ Error fetching milestones:', milestonesError.message);
      return;
    }

    console.log(`📋 Found ${milestones?.length || 0} milestones to award retroactively:`);
    milestones?.forEach(m => {
      console.log(`   • ${m.name}: +${m.spa_reward} SPA (${m.milestone_type})`);
    });

    console.log('');
    console.log('3. 🏆 PROCESSING RETROACTIVE AWARDS...');
    console.log('');

    let totalUsersProcessed = 0;
    let totalSpaAwarded = 0;

    for (const user of usersWithoutMilestones) {
      console.log(`👤 Processing user: ${user.user_id.slice(0, 8)}...`);
      console.log(`   Current SPA: ${user.spa_points || 0}`);
      console.log(`   Account created: ${new Date(user.created_at).toLocaleDateString()}`);

      let userSpaAwarded = 0;

      // Process each applicable milestone
      for (const milestone of milestones) {
        let shouldAward = false;

        // Determine if user should get this milestone
        if (milestone.milestone_type === 'account_creation') {
          // All users with accounts should get account creation
          shouldAward = true;
        } else if (milestone.milestone_type === 'rank_registration') {
          // Users with ranking records should get rank registration
          shouldAward = user.spa_points !== null; // Has ranking record
        }

        if (shouldAward) {
          console.log(`   ⚡ Awarding: ${milestone.name} (+${milestone.spa_reward} SPA)`);

          // 1. Create milestone progress record
          const { error: progressError } = await supabase
            .from('player_milestones')
            .insert({
              player_id: user.user_id,
              milestone_id: milestone.id,
              current_progress: milestone.requirement_value,
              is_completed: true,
              completed_at: new Date().toISOString(),
              times_completed: 1
            });

          if (progressError) {
            console.log(`   ❌ Failed to create milestone progress: ${progressError.message}`);
            continue;
          }

          // 2. Award SPA points using RPC function
          const { data: spaResult, error: spaError } = await supabase
            .rpc('update_spa_points', {
              p_user_id: user.user_id,
              p_points_change: milestone.spa_reward,
              p_transaction_type: 'retroactive_milestone',
              p_description: `Retroactive: ${milestone.name}`,
              p_reference_id: milestone.id
            });

          if (spaError) {
            console.log(`   ❌ Failed to award SPA: ${spaError.message}`);
            
            // Try manual fallback
            const newBalance = (user.spa_points || 0) + milestone.spa_reward;
            const { error: manualError } = await supabase
              .from('player_rankings')
              .update({ spa_points: newBalance })
              .eq('user_id', user.user_id);

            if (manualError) {
              console.log(`   ❌ Manual SPA update failed: ${manualError.message}`);
            } else {
              console.log(`   ✅ Manual SPA award: +${milestone.spa_reward} SPA`);
              userSpaAwarded += milestone.spa_reward;
            }
          } else {
            console.log(`   ✅ SPA awarded via RPC: +${milestone.spa_reward} SPA`);
            userSpaAwarded += milestone.spa_reward;
          }

          // 3. Create notification
          const { data: notificationId, error: notificationError } = await supabase
            .rpc('create_challenge_notification', {
              p_type: 'milestone_completed',
              p_user_id: user.user_id,
              p_title: '🏆 Hoàn thành milestone!',
              p_message: `🎉 ${milestone.name} - Nhận ${milestone.spa_reward} SPA! (Retroactive award)`,
              p_icon: 'trophy',
              p_priority: 'medium',
              p_action_text: 'Xem milestone',
              p_action_url: '/milestones',
              p_metadata: JSON.stringify({
                milestone_id: milestone.id,
                milestone_type: milestone.milestone_type,
                spa_reward: milestone.spa_reward,
                retroactive: true
              })
            });

          if (notificationError) {
            console.log(`   ⚠️  Notification failed: ${notificationError.message}`);
          } else {
            console.log(`   🔔 Notification created: ${notificationId}`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`   💰 Total SPA awarded to user: ${userSpaAwarded} SPA`);
      console.log('');

      totalUsersProcessed++;
      totalSpaAwarded += userSpaAwarded;
    }

    console.log('4. 📊 FINAL SUMMARY...');
    console.log('='.repeat(40));
    console.log(`✅ Users processed: ${totalUsersProcessed}`);
    console.log(`💰 Total SPA awarded: ${totalSpaAwarded} SPA`);
    console.log(`🏆 Milestones awarded: ${totalUsersProcessed * milestones.length}`);
    console.log('');

    console.log('5. 🔍 VERIFICATION...');
    
    // Quick verification - check if any users still don't have milestone progress
    const { data: remainingUsers, error: remainingError } = await supabase
      .from('player_rankings')
      .select('user_id')
      .not('user_id', 'in', 
        `(SELECT DISTINCT player_id FROM player_milestones WHERE player_id IS NOT NULL)`
      );

    if (remainingError) {
      console.log(`⚠️  Could not verify remaining users: ${remainingError.message}`);
    } else {
      console.log(`📋 Users still without milestones: ${remainingUsers?.length || 0}`);
      
      if (remainingUsers && remainingUsers.length === 0) {
        console.log('🎉 ALL USERS NOW HAVE MILESTONE PROGRESS RECORDS!');
      }
    }

    console.log('');
    console.log('🎯 RETROACTIVE AWARD COMPLETE!');
    console.log('');
    console.log('📋 WHAT HAPPENED:');
    console.log('✅ Existing users got milestone progress records');
    console.log('✅ SPA points awarded retroactively');
    console.log('✅ Notifications created for milestone completions');
    console.log('✅ Users can now see their milestone achievements');
    console.log('');
    console.log('🔔 NEXT STEPS:');
    console.log('1. Users will see notifications about retroactive awards');
    console.log('2. SPA balances are updated in real-time');
    console.log('3. Milestone pages will show completed milestones');
    console.log('4. Future milestones will work normally for all users');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

retroactivelyAwardMilestones();
