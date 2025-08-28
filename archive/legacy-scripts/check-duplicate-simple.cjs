const { createClient } = require('@supabase/supabase-js');

// Hardcode credentials (already public in other files)
const supabaseUrl = "https://exlqvlbawytbglioqfbc.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDuplicateMilestones() {
  try {
    console.log('🔍 Checking for duplicate milestone awards...\n');

    // 1. Get milestone info
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('name', 'Đăng ký hạng thành công')
      .single();

    if (milestoneError) {
      console.error('❌ Error getting milestone:', milestoneError);
      return;
    }

    console.log('🎯 Milestone Info:');
    console.log(`   ID: ${milestone.id}`);
    console.log(`   Name: ${milestone.name}`);
    console.log(`   Repeatable: ${milestone.is_repeatable}`);
    console.log(`   SPA Reward: ${milestone.spa_reward}`);

    // 2. Get all milestone awards for this milestone
    const { data: awards, error: awardsError } = await supabase
      .from('milestone_awards')
      .select('*')
      .eq('milestone_id', milestone.id)
      .eq('event_type', 'rank_registration')
      .order('awarded_at', { ascending: false });

    if (awardsError) {
      console.error('❌ Error getting awards:', awardsError);
      return;
    }

    console.log(`\n📊 Total awards: ${awards.length}`);

    // 3. Group awards by player_id
    const playerGroups = {};
    awards.forEach(award => {
      if (!playerGroups[award.player_id]) {
        playerGroups[award.player_id] = [];
      }
      playerGroups[award.player_id].push(award);
    });

    // 4. Find duplicates
    let duplicateCount = 0;
    console.log('\n🔍 Duplicate Analysis:');
    console.log('='.repeat(60));

    for (const [playerId, playerAwards] of Object.entries(playerGroups)) {
      if (playerAwards.length > 1) {
        duplicateCount++;
        
        // Get player name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', playerId)
          .single();

        console.log(`\n👤 ${profile?.display_name || 'Unknown'} (${playerId.slice(0, 8)}...)`);
        console.log(`   🔢 Awards: ${playerAwards.length}`);
        console.log(`   💰 Total SPA: ${playerAwards.reduce((sum, a) => sum + a.spa_points_awarded, 0)}`);
        
        playerAwards.forEach((award, index) => {
          console.log(`   ${index + 1}. ${award.awarded_at} - ${award.status} (+${award.spa_points_awarded} SPA) - ID: ${award.id.slice(0, 8)}`);
        });

        // Time analysis
        if (playerAwards.length >= 2) {
          const time1 = new Date(playerAwards[0].awarded_at);
          const time2 = new Date(playerAwards[1].awarded_at);
          const diffMinutes = Math.abs(time1 - time2) / (1000 * 60);
          
          console.log(`   ⏱️  Time gap: ${diffMinutes.toFixed(1)} minutes`);
          
          if (diffMinutes < 5) {
            console.log(`   ⚠️  SUSPICIOUS: Awards too close together!`);
          }
        }
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Total players with awards: ${Object.keys(playerGroups).length}`);
    console.log(`   Players with duplicates: ${duplicateCount}`);
    console.log(`   Duplicate rate: ${(duplicateCount / Object.keys(playerGroups).length * 100).toFixed(1)}%`);

    if (duplicateCount > 0) {
      console.log('\n🚨 POTENTIAL CAUSES:');
      console.log('   1. Race condition in trigger function');
      console.log('   2. Manual scripts run multiple times');
      console.log('   3. Milestone marked as repeatable incorrectly');
      console.log('   4. Direct database manipulations');
      
      if (milestone.is_repeatable) {
        console.log('\n⚠️  ISSUE FOUND: Milestone is marked as REPEATABLE!');
        console.log('   For rank registration, this should be FALSE');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDuplicateMilestones();
