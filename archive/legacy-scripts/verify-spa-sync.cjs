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

async function verifySpaSync() {
  try {
    console.log('🔍 Verifying SPA sync results...\n');

    // 1. Check users who received milestones today
    const { data: todaysMilestones, error: milestonesError } = await supabase
      .from('milestone_awards')
      .select('player_id, spa_points_awarded, awarded_at, profiles(display_name)')
      .eq('event_type', 'rank_registration')
      .gte('awarded_at', '2025-08-22T00:00:00Z')
      .order('awarded_at', { ascending: false });

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      return;
    }

    console.log('📋 Users who received rank registration milestones today:');
    console.log('='.repeat(60));

    const userMilestones = {};
    todaysMilestones.forEach(milestone => {
      if (!userMilestones[milestone.player_id]) {
        userMilestones[milestone.player_id] = {
          name: milestone.profiles?.display_name || 'Unknown',
          totalSpa: 0,
          awards: []
        };
      }
      userMilestones[milestone.player_id].totalSpa += milestone.spa_points_awarded;
      userMilestones[milestone.player_id].awards.push({
        spa: milestone.spa_points_awarded,
        time: milestone.awarded_at
      });
    });

    // 2. Check their current SPA in player_rankings (what frontend reads)
    for (const [userId, milestoneData] of Object.entries(userMilestones)) {
      console.log(`\n👤 ${milestoneData.name} (${userId}):`);
      console.log(`   🏆 Milestone SPA awarded: ${milestoneData.totalSpa}`);
      console.log(`   📅 Awards: ${milestoneData.awards.length}`);

      // Check player_rankings (frontend source)
      const { data: ranking, error: rankingError } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      if (rankingError) {
        console.log(`   ❌ Error checking player_rankings: ${rankingError.message}`);
      } else {
        console.log(`   💰 Current SPA in player_rankings: ${ranking.spa_points || 0}`);
        
        if (ranking.spa_points >= milestoneData.totalSpa) {
          console.log(`   ✅ SPA SYNC: SUCCESS - Frontend will show correct SPA`);
        } else {
          console.log(`   ❌ SPA SYNC: FAILED - Frontend will show incorrect SPA`);
        }
      }

      // Also check profiles for comparison
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      if (!profileError) {
        console.log(`   📊 SPA in profiles: ${profile.spa_points || 0} (not used by frontend)`);
      }
    }

    // 3. Test SPA service call (simulate frontend)
    console.log('\n🧪 Testing SPA service calls (simulating frontend)...');
    console.log('='.repeat(60));

    for (const [userId, milestoneData] of Object.entries(userMilestones)) {
      // This simulates what spaService.getCurrentSPAPoints() does
      const { data: spaData, error: spaError } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      if (spaError) {
        console.log(`❌ ${milestoneData.name}: SPA service would fail`);
      } else {
        console.log(`✅ ${milestoneData.name}: Frontend would display ${spaData.spa_points || 0} SPA`);
      }
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SPA SYNC VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const totalUsers = Object.keys(userMilestones).length;
    let successCount = 0;
    
    for (const [userId, milestoneData] of Object.entries(userMilestones)) {
      const { data: ranking } = await supabase
        .from('player_rankings')
        .select('spa_points')
        .eq('user_id', userId)
        .single();
      
      if (ranking && ranking.spa_points >= milestoneData.totalSpa) {
        successCount++;
      }
    }

    console.log(`👥 Total users with milestones: ${totalUsers}`);
    console.log(`✅ Users with correct SPA display: ${successCount}`);
    console.log(`📈 Success rate: ${((successCount / totalUsers) * 100).toFixed(1)}%`);
    
    if (successCount === totalUsers) {
      console.log('\n🎉 ALL USERS NOW HAVE CORRECT SPA DISPLAY!');
      console.log('Frontend will show the correct SPA amounts for all users.');
    } else {
      console.log(`\n⚠️  ${totalUsers - successCount} users still need SPA sync.`);
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('1. Open the app at http://localhost:8000/');
    console.log('2. Check user profiles → SPA tab');
    console.log('3. SPA should now display correctly!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error verifying SPA sync:', error);
  }
}

// Run verification
verifySpaSync();
