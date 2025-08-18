const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function retroactiveMilestoneAward() {
  try {
    console.log('🚀 === RETROACTIVE MILESTONE AWARD SYSTEM ===');
    console.log('Đang xử lý milestone cho 56 users hiện tại...\n');

    // 1. Lấy tất cả users
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('user_id, display_name, created_at, avatar_url, bio, phone, city');

    if (userError) {
      console.error('❌ Lỗi lấy users:', userError);
      return;
    }

    console.log(`📊 Tìm thấy ${users.length} users`);

    // 2. Lấy tất cả milestone definitions
    const { data: milestones, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('is_active', true);

    if (milestoneError) {
      console.error('❌ Lỗi lấy milestones:', milestoneError);
      return;
    }

    console.log(`🎯 Tìm thấy ${milestones.length} milestone definitions\n`);

    // 3. Lấy player rankings cho tất cả users
    const { data: playerRankings, error: rankError } = await supabase
      .from('player_rankings')
      .select('*');

    if (rankError) {
      console.error('❌ Lỗi lấy player rankings:', rankError);
      return;
    }

    // 4. Tạo map player rankings
    const playerRankingsMap = {};
    playerRankings.forEach(rank => {
      playerRankingsMap[rank.player_id] = rank;
    });

    // 5. Lấy existing milestone tracking
    const { data: existingMilestones, error: existingError } = await supabase
      .from('player_milestones')
      .select('player_id, milestone_id, is_completed');

    if (existingError) {
      console.error('❌ Lỗi lấy existing milestones:', existingError);
      return;
    }

    // Tạo set của milestone đã có
    const existingMilestoneSet = new Set();
    existingMilestones.forEach(pm => {
      existingMilestoneSet.add(`${pm.player_id}-${pm.milestone_id}`);
    });

    let totalUsersProcessed = 0;
    let totalMilestonesAwarded = 0;
    let totalSpaAwarded = 0;

    // 6. Xử lý từng user
    for (const user of users) {
      const playerRanking = playerRankingsMap[user.user_id];
      let userMilestonesAwarded = 0;
      let userSpaAwarded = 0;

      console.log(`\n👤 Xử lý user: ${user.display_name}`);

      // Xử lý từng milestone
      for (const milestone of milestones) {
        const milestoneKey = `${user.user_id}-${milestone.id}`;
        
        // Skip nếu đã có milestone này
        if (existingMilestoneSet.has(milestoneKey)) {
          continue;
        }

        let shouldAward = false;
        let currentProgress = 0;

        // Kiểm tra điều kiện milestone
        switch (milestone.milestone_type) {
          case 'account_creation':
            shouldAward = true;
            currentProgress = 1;
            break;

          case 'avatar_upload':
            shouldAward = user.avatar_url && user.avatar_url.trim() !== '';
            currentProgress = shouldAward ? 1 : 0;
            break;

          case 'profile_complete':
            // Kiểm tra profile completion (có đủ thông tin cơ bản)
            const hasBasicInfo = user.display_name && user.bio && user.phone && user.city;
            shouldAward = hasBasicInfo;
            currentProgress = shouldAward ? 1 : 0;
            break;

          case 'match_count':
            if (playerRanking) {
              shouldAward = playerRanking.total_matches >= milestone.requirement_value;
              currentProgress = playerRanking.total_matches;
            }
            break;

          case 'first_match':
            if (playerRanking) {
              shouldAward = playerRanking.total_matches >= 1;
              currentProgress = shouldAward ? 1 : 0;
            }
            break;

          case 'win_streak':
            if (playerRanking) {
              shouldAward = playerRanking.win_streak >= milestone.requirement_value;
              currentProgress = playerRanking.win_streak || 0;
            }
            break;

          case 'win_rate':
            if (playerRanking && playerRanking.total_matches >= 5) {
              const winRate = (playerRanking.wins / playerRanking.total_matches) * 100;
              shouldAward = winRate >= milestone.requirement_value;
              currentProgress = Math.floor(winRate);
            }
            break;

          case 'rank_registration':
            // Kiểm tra nếu user đã đăng ký rank (có verified_rank)
            const { data: profileData } = await supabase
              .from('profiles')
              .select('verified_rank')
              .eq('user_id', user.user_id)
              .single();
            
            shouldAward = profileData?.verified_rank !== null;
            currentProgress = shouldAward ? 1 : 0;
            break;

          // Thêm các milestone type khác nếu cần
          default:
            // Skip milestone không xử lý được
            continue;
        }

        if (shouldAward) {
          try {
            // Tạo player_milestone record
            const { error: milestoneInsertError } = await supabase
              .from('player_milestones')
              .insert({
                player_id: user.user_id,
                milestone_id: milestone.id,
                current_progress: currentProgress,
                is_completed: true,
                completed_at: new Date().toISOString(),
                times_completed: 1,
                user_name: user.display_name
              });

            if (milestoneInsertError) {
              console.log(`   ❌ Lỗi tạo milestone record: ${milestoneInsertError.message}`);
              continue;
            }

            // Award SPA points bằng function update_spa_points
            const { error: spaError } = await supabase
              .rpc('update_spa_points', {
                user_id: user.user_id,
                points_to_add: milestone.spa_reward,
                source_type: 'milestone_reward',
                transaction_type: 'credit',
                description: `Milestone: ${milestone.name}`,
                reference_id: milestone.id,
                metadata: {
                  milestone_type: milestone.milestone_type,
                  requirement_value: milestone.requirement_value,
                  retroactive: true
                }
              });

            if (spaError) {
              console.log(`   ❌ Lỗi award SPA: ${spaError.message}`);
              continue;
            }

            console.log(`   ✅ ${milestone.name}: +${milestone.spa_reward} SPA`);
            userMilestonesAwarded++;
            userSpaAwarded += milestone.spa_reward;

          } catch (error) {
            console.log(`   ❌ Lỗi xử lý milestone ${milestone.name}:`, error.message);
          }
        }
      }

      if (userMilestonesAwarded > 0) {
        console.log(`   🎉 Awarded ${userMilestonesAwarded} milestones, total ${userSpaAwarded} SPA`);
        totalMilestonesAwarded += userMilestonesAwarded;
        totalSpaAwarded += userSpaAwarded;
      } else {
        console.log(`   ℹ️  Không có milestone mới nào`);
      }

      totalUsersProcessed++;
    }

    console.log('\n🎊 === KẾT QUẢ TỔNG KẾT ===');
    console.log(`👥 Users đã xử lý: ${totalUsersProcessed}`);
    console.log(`🏆 Tổng milestones awarded: ${totalMilestonesAwarded}`);
    console.log(`💰 Tổng SPA awarded: ${totalSpaAwarded}`);
    console.log('\n✅ Hoàn thành retroactive milestone award!');

  } catch (error) {
    console.error('❌ Lỗi tổng quát:', error);
  }
}

// Chạy script
if (require.main === module) {
  retroactiveMilestoneAward();
}

module.exports = { retroactiveMilestoneAward };
