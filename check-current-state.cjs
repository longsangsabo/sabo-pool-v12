const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://exlqvlbawytbglioqfbc.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkCurrentState() {
  try {
    console.log('🔍 Current state before fixing race condition...\n');

    // Get milestone ID
    const { data: milestone } = await supabase
      .from('milestones')
      .select('id')
      .eq('name', 'Đăng ký hạng thành công')
      .single();

    if (!milestone) {
      console.error('❌ Milestone not found');
      return;
    }

    // Get all affected users with detailed info
    const { data: results, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            p.display_name,
            ma.player_id,
            COUNT(*) as award_count,
            SUM(ma.spa_points_awarded) as total_spa_awarded,
            pr.spa_points as current_spa_balance,
            array_agg(ma.awarded_at ORDER BY ma.awarded_at) as award_times,
            array_agg(ma.id ORDER BY ma.awarded_at) as award_ids
          FROM milestone_awards ma
          JOIN profiles p ON p.user_id = ma.player_id  
          JOIN player_rankings pr ON pr.user_id = ma.player_id
          WHERE ma.milestone_id = '${milestone.id}'
          AND ma.event_type = 'rank_registration'
          GROUP BY ma.player_id, p.display_name, pr.spa_points
          ORDER BY award_count DESC, p.display_name
        `
      });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📊 CURRENT STATE ANALYSIS:');
    console.log('='.repeat(60));

    let totalUsers = 0;
    let duplicateUsers = 0;
    let excessSPA = 0;

    results.forEach(user => {
      totalUsers++;
      const isCorrect = user.award_count === 1 && user.total_spa_awarded === user.current_spa_balance;
      
      console.log(`\n👤 ${user.display_name} (${user.player_id.slice(0, 8)}...)`);
      console.log(`   🏆 Awards: ${user.award_count}`);
      console.log(`   💰 SPA Awarded: ${user.total_spa_awarded}`);
      console.log(`   💵 Current Balance: ${user.current_spa_balance}`);
      
      if (user.award_count > 1) {
        duplicateUsers++;
        const extraSPA = (user.award_count - 1) * 150;
        excessSPA += extraSPA;
        console.log(`   ⚠️  DUPLICATE! Extra ${extraSPA} SPA needs to be removed`);
        
        // Show award timeline
        console.log(`   📅 Award times:`);
        user.award_times.forEach((time, index) => {
          console.log(`      ${index + 1}. ${time} (ID: ${user.award_ids[index].slice(0, 8)})`);
        });
        
        if (user.award_times.length >= 2) {
          const time1 = new Date(user.award_times[0]);
          const time2 = new Date(user.award_times[1]);
          const diffMs = Math.abs(time1 - time2);
          const diffSeconds = diffMs / 1000;
          console.log(`   ⏱️  Gap between awards: ${diffSeconds.toFixed(2)} seconds`);
        }
      } else {
        console.log(`   ✅ CORRECT`);
      }
    });

    console.log('\n📈 SUMMARY:');
    console.log('='.repeat(40));
    console.log(`👥 Total users: ${totalUsers}`);
    console.log(`🔄 Users with duplicates: ${duplicateUsers}`);
    console.log(`💰 Excess SPA to remove: ${excessSPA}`);
    console.log(`📊 Duplicate rate: ${(duplicateUsers / totalUsers * 100).toFixed(1)}%`);

    if (duplicateUsers > 0) {
      console.log('\n🚨 RACE CONDITION CONFIRMED!');
      console.log('   - Multiple awards within seconds of each other');
      console.log('   - Current trigger logic has no duplicate prevention');
      console.log('   - Users have received extra SPA they should not have');
      
      console.log('\n🔧 PROPOSED FIX:');
      console.log('   1. Add UNIQUE constraint on (player_id, milestone_id, event_type)');
      console.log('   2. Update function to use INSERT ... ON CONFLICT DO NOTHING');
      console.log('   3. Remove duplicate awards and fix SPA balances');
      console.log('   4. Prevent future race conditions');
    } else {
      console.log('\n✅ NO DUPLICATES FOUND - System is working correctly');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCurrentState();
