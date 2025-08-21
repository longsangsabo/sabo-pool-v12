const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function findAndAwardMissingMilestones() {
  try {
    console.log('=== TÌM VÀ AWARD MILESTONE CÒN THIẾU ===');

    // Get rank_registration milestone
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, name, milestone_type, spa_reward')
      .eq('milestone_type', 'rank_registration')
      .single();

    if (!milestones) {
      console.log('❌ Không tìm thấy rank_registration milestone');
      return;
    }

    console.log(`🎯 Target: ${milestones.name} (${milestones.spa_reward} SPA)`);

    // Get all users with verified ranks
    const { data: rankedUsers } = await supabase
      .from('profiles')
      .select('user_id, display_name, verified_rank')
      .not('verified_rank', 'is', null);

    console.log(`\n👥 Users with verified ranks: ${rankedUsers?.length || 0}`);

    // Get users who already have this milestone
    const { data: completedUsers } = await supabase
      .from('player_milestones')
      .select('player_id')
      .eq('milestone_id', milestones.id)
      .eq('is_completed', true);

    const completedUserIds = new Set(completedUsers?.map(u => u.player_id) || []);
    console.log(`✅ Users already completed: ${completedUserIds.size}`);

    // Find users who should have but don't have the milestone
    const missingUsers = rankedUsers?.filter(user => !completedUserIds.has(user.user_id)) || [];
    
    console.log(`\n🔍 Users missing rank_registration milestone: ${missingUsers.length}`);
    
    if (missingUsers.length === 0) {
      console.log('🎉 All eligible users already have the milestone!');
      return;
    }

    let awarded = 0;
    let totalSpa = 0;

    // Award milestone to missing users
    for (const user of missingUsers) {
      try {
        console.log(`\n⚙️  Processing ${user.display_name} (rank: ${user.verified_rank})`);

        // Insert milestone record
        const { error: insertError } = await supabase
          .from('player_milestones')
          .insert({
            player_id: user.user_id,
            milestone_id: milestones.id,
            current_progress: 1,
            is_completed: true,
            completed_at: new Date().toISOString(),
            times_completed: 1,
            user_name: user.display_name
          });

        if (insertError) {
          console.log(`   ❌ Insert error: ${insertError.message}`);
          continue;
        }

        // Award SPA
        const { error: spaError } = await supabase.rpc('update_spa_points', {
          p_user_id: user.user_id,
          p_points: milestones.spa_reward,
          p_source_type: 'milestone_reward',
          p_description: `Milestone: ${milestones.name} (${user.verified_rank})`,
          p_transaction_type: 'credit'
        });

        if (spaError) {
          console.log(`   ❌ SPA error: ${spaError.message}`);
          continue;
        }

        console.log(`   ✅ Success: +${milestones.spa_reward} SPA awarded`);
        awarded++;
        totalSpa += milestones.spa_reward;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`🏆 Users awarded: ${awarded}`);
    console.log(`💰 Total SPA awarded: ${totalSpa} SPA`);
    console.log(`✅ Process completed!`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findAndAwardMissingMilestones();
