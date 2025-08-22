const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addSpaAndNotifyMissedUsers() {
  try {
    console.log('🎯 Cộng SPA và gửi thông báo cho user bị miss milestone...\n');

    // 1. Tìm milestone rank registration
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('name', 'Đăng ký hạng thành công')
      .single();

    if (milestoneError) {
      console.error('Error finding milestone:', milestoneError);
      return;
    }

    console.log('Found milestone:', milestone.name, `(${milestone.spa_reward} SPA)`);

    // 2. Tìm tất cả user đã được approve rank nhưng chưa có milestone
    const { data: allApprovals, error: approvalsError } = await supabase
      .from('rank_requests')
      .select('user_id, id, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false });

    if (approvalsError) {
      console.error('Error fetching approvals:', approvalsError);
      return;
    }

    console.log(`\nChecking ${allApprovals.length} approved rank requests...\n`);

    const usersMissingMilestone = [];
    const checkedUsers = new Set(); // Tránh duplicate user

    for (const approval of allApprovals) {
      if (checkedUsers.has(approval.user_id)) continue;
      checkedUsers.add(approval.user_id);

      // Kiểm tra user có milestone chưa
      const { data: existingAward, error: awardError } = await supabase
        .from('milestone_awards')
        .select('*')
        .eq('player_id', approval.user_id)
        .eq('milestone_id', milestone.id)
        .eq('event_type', 'rank_registration');

      if (awardError) {
        console.error(`Error checking ${approval.user_id}:`, awardError);
        continue;
      }

      if (existingAward.length === 0) {
        // User missing milestone - get profile info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, display_name, spa_points')
          .eq('user_id', approval.user_id)
          .single();

        if (!profileError && profile) {
          usersMissingMilestone.push({
            ...approval,
            profile
          });
          console.log(`❌ Missing: ${profile.display_name} (${approval.user_id})`);
        }
      } else {
        // User đã có milestone
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', approval.user_id)
          .single();
        
        if (!profileError) {
          console.log(`✅ Has milestone: ${profile.display_name}`);
        }
      }
    }

    console.log(`\n🔧 Found ${usersMissingMilestone.length} users missing milestone...\n`);

    if (usersMissingMilestone.length === 0) {
      console.log('🎉 All users already have their milestones!');
      return;
    }

    // 3. Cộng milestone và SPA cho từng user
    for (const user of usersMissingMilestone) {
      console.log(`\n🎯 Processing: ${user.profile.display_name}...`);

      try {
        // 3a. Thêm milestone award
        const { data: newAward, error: awardError } = await supabase
          .from('milestone_awards')
          .insert({
            player_id: user.user_id,
            milestone_id: milestone.id,
            event_type: 'rank_registration',
            spa_points_awarded: milestone.spa_reward,
            occurrence: 1,
            status: 'success',
            awarded_at: new Date().toISOString(),
            reason: 'Backfill for missing milestone'
          })
          .select()
          .single();

        if (awardError) {
          console.error(`❌ Failed to add milestone: ${awardError.message}`);
          continue;
        }

        console.log(`✅ Added milestone award`);

        // 3b. Cộng SPA points
        const newSpaTotal = (user.profile.spa_points || 0) + milestone.spa_reward;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ spa_points: newSpaTotal })
          .eq('user_id', user.user_id);

        if (updateError) {
          console.error(`❌ Failed to update SPA: ${updateError.message}`);
          continue;
        }

        console.log(`✅ Updated SPA: ${user.profile.spa_points || 0} → ${newSpaTotal}`);

        // 3c. Gửi thông báo
        const notificationMessage = {
          title: '🎯 Milestone Completed!',
          message: `Chúc mừng! Bạn đã nhận được milestone "${milestone.name}" và được cộng ${milestone.spa_reward} SPA points!`,
          type: 'milestone_achievement',
          data: {
            milestone_id: milestone.id,
            milestone_name: milestone.name,
            spa_awarded: milestone.spa_reward,
            badge_icon: milestone.badge_icon,
            badge_name: milestone.badge_name
          }
        };

        const { data: notification, error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.user_id,
            title: notificationMessage.title,
            message: notificationMessage.message,
            type: notificationMessage.type,
            data: notificationMessage.data,
            is_read: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (notificationError) {
          console.error(`❌ Failed to send notification: ${notificationError.message}`);
        } else {
          console.log(`✅ Sent notification`);
        }

        console.log(`🎉 Completed for ${user.profile.display_name}!`);

      } catch (error) {
        console.error(`❌ Error processing ${user.profile.display_name}:`, error);
      }
    }

    // 4. Summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 MILESTONE BACKFILL SUMMARY');
    console.log('='.repeat(60));
    console.log(`🎯 Milestone: ${milestone.name}`);
    console.log(`💰 SPA Reward: ${milestone.spa_reward} per user`);
    console.log(`👥 Users processed: ${usersMissingMilestone.length}`);
    console.log(`💎 Total SPA distributed: ${usersMissingMilestone.length * milestone.spa_reward}`);
    console.log(`📱 Notifications sent: ${usersMissingMilestone.length}`);
    console.log('');

    // 5. Final verification
    console.log('🔍 Final verification...');
    let successCount = 0;
    
    for (const user of usersMissingMilestone) {
      const { data: verifyAward, error: verifyError } = await supabase
        .from('milestone_awards')
        .select('id')
        .eq('player_id', user.user_id)
        .eq('milestone_id', milestone.id)
        .eq('event_type', 'rank_registration');

      if (!verifyError && verifyAward.length > 0) {
        successCount++;
      }
    }

    console.log(`✅ Success rate: ${successCount}/${usersMissingMilestone.length} users`);
    
    if (successCount === usersMissingMilestone.length) {
      console.log('🎉 ALL USERS SUCCESSFULLY PROCESSED!');
    } else {
      console.log('⚠️  Some users may need manual review');
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error in milestone backfill:', error);
  }
}

// Run the backfill
addSpaAndNotifyMissedUsers();
