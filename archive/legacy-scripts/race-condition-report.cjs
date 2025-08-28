const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://exlqvlbawytbglioqfbc.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function reportRaceConditionFix() {
  try {
    console.log('🔍 RACE CONDITION REPORT\n');

    // Get milestone ID
    const { data: milestone } = await supabase
      .from('milestones')
      .select('*')
      .eq('name', 'Đăng ký hạng thành công')
      .single();

    console.log('🎯 Milestone: "Đăng ký hạng thành công"');
    console.log(`   ID: ${milestone.id}`);
    console.log(`   SPA Reward: ${milestone.spa_reward}`);
    console.log(`   Repeatable: ${milestone.is_repeatable}`);

    // Get all milestone awards
    const { data: awards } = await supabase
      .from('milestone_awards')
      .select('*')
      .eq('milestone_id', milestone.id)
      .eq('event_type', 'rank_registration')
      .order('awarded_at', { ascending: true });

    console.log(`\n📊 Total awards found: ${awards.length}`);

    // Group by user
    const userGroups = {};
    awards.forEach(award => {
      if (!userGroups[award.player_id]) {
        userGroups[award.player_id] = [];
      }
      userGroups[award.player_id].push(award);
    });

    // Analyze duplicates
    let duplicateUsers = 0;
    let extraAwards = 0;
    let extraSPA = 0;

    console.log('\n🔍 DUPLICATE ANALYSIS:');
    console.log('='.repeat(50));

    for (const [playerId, userAwards] of Object.entries(userGroups)) {
      if (userAwards.length > 1) {
        duplicateUsers++;
        extraAwards += (userAwards.length - 1);
        extraSPA += (userAwards.length - 1) * milestone.spa_reward;

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', playerId)
          .single();

        // Get current SPA balance
        const { data: ranking } = await supabase
          .from('player_rankings')
          .select('spa_points')
          .eq('user_id', playerId)
          .single();

        console.log(`\n👤 ${profile?.display_name || 'Unknown'}`);
        console.log(`   User ID: ${playerId}`);
        console.log(`   🔢 Awards: ${userAwards.length} (should be 1)`);
        console.log(`   💰 Extra SPA: ${(userAwards.length - 1) * milestone.spa_reward}`);
        console.log(`   💵 Current balance: ${ranking?.spa_points || 0}`);

        // Show timeline
        console.log(`   📅 Award timeline:`);
        userAwards.forEach((award, index) => {
          console.log(`      ${index + 1}. ${award.awarded_at} (${award.id.slice(0, 8)})`);
        });

        // Calculate time gaps
        if (userAwards.length >= 2) {
          const time1 = new Date(userAwards[0].awarded_at);
          const time2 = new Date(userAwards[1].awarded_at);
          const gapMs = Math.abs(time1 - time2);
          const gapSeconds = gapMs / 1000;
          
          console.log(`   ⏱️  Time gap: ${gapSeconds.toFixed(2)} seconds`);
          
          if (gapSeconds < 1) {
            console.log(`   🚨 RACE CONDITION CONFIRMED!`);
          }
        }
      }
    }

    console.log('\n📈 SUMMARY:');
    console.log('='.repeat(40));
    console.log(`👥 Total users with awards: ${Object.keys(userGroups).length}`);
    console.log(`🔄 Users with duplicates: ${duplicateUsers}`);
    console.log(`📊 Duplicate rate: ${(duplicateUsers / Object.keys(userGroups).length * 100).toFixed(1)}%`);
    console.log(`🏆 Extra awards to remove: ${extraAwards}`);
    console.log(`💰 Extra SPA to deduct: ${extraSPA}`);

    console.log('\n🔧 ROOT CAUSE: RACE CONDITION');
    console.log('='.repeat(40));
    console.log('❌ Current trigger logic:');
    console.log('   1. SELECT to check existing awards');
    console.log('   2. IF NOT FOUND THEN INSERT new award');
    console.log('   3. 🚨 TWO triggers can pass step 1 simultaneously!');

    console.log('\n✅ SOLUTION IMPLEMENTED:');
    console.log('   1. 🔒 UNIQUE constraint on (player_id, milestone_id, event_type)');
    console.log('   2. 🛡️  INSERT ... ON CONFLICT DO NOTHING');
    console.log('   3. 🧹 Clean up existing duplicates');
    console.log('   4. 🔄 Fix SPA balances');

    if (duplicateUsers > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log(`   Deploy fix-race-condition-duplicates.sql to fix ${duplicateUsers} users`);
    } else {
      console.log('\n✅ NO ACTION NEEDED - System is clean');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

reportRaceConditionFix();
