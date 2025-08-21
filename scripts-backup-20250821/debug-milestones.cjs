const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function debugMilestones() {
  try {
    console.log('=== DEBUG MILESTONE STATUS ===');

    // 1. Check specific milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, name, milestone_type, spa_reward')
      .in('milestone_type', ['account_creation', 'rank_registration']);

    console.log('\nTarget milestones:');
    milestones?.forEach(m => {
      console.log(`  ${m.milestone_type}: ${m.id.substring(0,8)}... -> ${m.spa_reward} SPA`);
    });

    if (!milestones || milestones.length === 0) {
      console.log('\n❌ No milestone definitions found!');
      return;
    }

    // 2. Check how many users have these milestones completed
    for (const milestone of milestones) {
      const { data: completedUsers } = await supabase
        .from('player_milestones')
        .select('player_id, user_name, is_completed')
        .eq('milestone_id', milestone.id)
        .eq('is_completed', true);

      console.log(`\n📊 ${milestone.milestone_type}: ${completedUsers?.length || 0}/56 users completed`);
      
      if (completedUsers && completedUsers.length > 0) {
        console.log('   Sample completed users:');
        completedUsers.slice(0, 3).forEach(u => {
          console.log(`     - ${u.user_name}`);
        });
      }
    }

    // 3. Check users without these milestones
    const accountMilestone = milestones.find(m => m.milestone_type === 'account_creation');
    if (accountMilestone) {
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .limit(5);

      console.log('\n🔍 Sample users milestone check:');
      for (const user of allUsers || []) {
        const { data: userMilestone } = await supabase
          .from('player_milestones')
          .select('is_completed')
          .eq('player_id', user.user_id)
          .eq('milestone_id', accountMilestone.id)
          .maybeSingle();

        console.log(`   ${user.display_name}: ${userMilestone?.is_completed ? 'HAS' : 'MISSING'} account milestone`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugMilestones();
