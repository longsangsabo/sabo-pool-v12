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

async function analyzeDuplicateMilestones() {
  try {
    console.log('🔍 Analyzing duplicate "Đăng ký hạng thành công" milestones...\n');

    // 1. Get milestone ID for rank registration
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('name', 'Đăng ký hạng thành công')
      .single();

    if (milestoneError) {
      console.error('Error getting milestone:', milestoneError);
      return;
    }

    console.log('🎯 Milestone Info:');
    console.log(`   ID: ${milestone.id}`);
    console.log(`   Name: ${milestone.name}`);
    console.log(`   Repeatable: ${milestone.is_repeatable}`);
    console.log(`   SPA Reward: ${milestone.spa_reward}`);

    // 2. Find users with duplicate milestone awards
    const { data: duplicates, error: duplicatesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            player_id,
            COUNT(*) as award_count,
            MIN(awarded_at) as first_award,
            MAX(awarded_at) as last_award,
            SUM(spa_points_awarded) as total_spa
          FROM milestone_awards 
          WHERE milestone_id = '${milestone.id}'
          AND event_type = 'rank_registration'
          GROUP BY player_id 
          HAVING COUNT(*) > 1
          ORDER BY award_count DESC, last_award DESC
        `
      });

    if (duplicatesError) {
      console.error('Error finding duplicates:', duplicatesError);
      
      // Alternative approach without exec_sql
      const { data: allAwards, error: allAwardsError } = await supabase
        .from('milestone_awards')
        .select('*')
        .eq('milestone_id', milestone.id)
        .eq('event_type', 'rank_registration')
        .order('awarded_at', { ascending: false });

      if (allAwardsError) {
        console.error('Error getting all awards:', allAwardsError);
        return;
      }

      // Group by player_id manually
      const playerGroups = {};
      allAwards.forEach(award => {
        if (!playerGroups[award.player_id]) {
          playerGroups[award.player_id] = [];
        }
        playerGroups[award.player_id].push(award);
      });

      console.log('\n📊 Duplicate Analysis:');
      console.log('='.repeat(60));

      for (const [playerId, awards] of Object.entries(playerGroups)) {
        if (awards.length > 1) {
          // Get user info
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', playerId)
            .single();

          console.log(`\n👤 ${profile?.display_name || 'Unknown'} (${playerId.slice(0, 8)}...)`);
          console.log(`   🔢 Total awards: ${awards.length}`);
          console.log(`   💰 Total SPA: ${awards.reduce((sum, a) => sum + a.spa_points_awarded, 0)}`);
          console.log(`   📅 Awards timeline:`);

          awards.forEach((award, index) => {
            console.log(`      ${index + 1}. ${award.awarded_at} (+${award.spa_points_awarded} SPA)`);
            console.log(`         Status: ${award.status}, ID: ${award.id}`);
          });

          // Check corresponding rank requests
          console.log(`   📋 Rank request history:`);
          const { data: rankRequests } = await supabase
            .from('rank_requests')
            .select('*')
            .eq('user_id', playerId)
            .eq('status', 'approved')
            .order('updated_at', { ascending: false });

          if (rankRequests) {
            rankRequests.forEach((req, index) => {
              console.log(`      ${index + 1}. Request ${req.id.slice(0, 8)}: Approved at ${req.updated_at}`);
            });
          }

          // Check why duplicates happened
          console.log(`   🔍 Possible causes:`);
          
          // Check if milestone is marked as repeatable
          if (milestone.is_repeatable) {
            console.log(`      ⚠️  Milestone is marked as REPEATABLE (should be false for rank registration)`);
          }

          // Check time gaps between awards
          if (awards.length >= 2) {
            const timeDiff = new Date(awards[0].awarded_at) - new Date(awards[1].awarded_at);
            const minutesDiff = Math.abs(timeDiff) / (1000 * 60);
            
            if (minutesDiff < 5) {
              console.log(`      ⚠️  Awards are ${minutesDiff.toFixed(1)} minutes apart (possible rapid trigger)`);
            }
            
            if (minutesDiff < 1) {
              console.log(`      🚨 Awards are ${(minutesDiff * 60).toFixed(1)} seconds apart (likely duplicate trigger)`);
            }
          }

          // Check if manual script added duplicates
          awards.forEach((award, index) => {
            if (award.reason && award.reason.includes('Backfill')) {
              console.log(`      📝 Award ${index + 1} was from manual backfill script`);
            }
          });
        }
      }

      // 3. Check trigger function logic
      console.log('\n🔧 Trigger Analysis:');
      console.log('='.repeat(60));

      console.log('🤖 Current trigger logic should prevent duplicates by checking:');
      console.log('   1. IF NOT v_milestone.is_repeatable THEN');
      console.log('   2. Check existing awards with same player_id + milestone_id + event_type');
      console.log('   3. IF FOUND THEN return "already awarded"');

      console.log('\n🎯 Most likely causes of duplicates:');
      console.log('   1. 📝 Manual backfill scripts ran multiple times');
      console.log('   2. 🔄 Race condition - multiple approvals processed simultaneously');
      console.log('   3. 🐛 Trigger logic not working properly');
      console.log('   4. ⚡ Manual database updates bypassing trigger checks');

      // 4. Check recent trigger activity
      console.log('\n📈 Recent trigger activity analysis:');
      
      const recentAwards = allAwards.filter(award => 
        new Date(award.awarded_at) >= new Date('2025-08-22T01:00:00Z')
      );

      console.log(`   🕐 Awards since 1:00 AM today: ${recentAwards.length}`);
      
      for (const award of recentAwards) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', award.player_id)
          .single();
          
        console.log(`   - ${award.awarded_at}: ${profile?.display_name || 'Unknown'} (+${award.spa_points_awarded} SPA)`);
      }

    } else {
      console.log('Found duplicates using exec_sql:', duplicates);
    }

    // 5. Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(60));
    console.log('1. 🛡️  Ensure milestone.is_repeatable = false for rank registration');
    console.log('2. 🧹 Clean up duplicate awards (keep earliest, remove others)');
    console.log('3. 🔄 Update SPA balances to reflect correct amount');
    console.log('4. 🚫 Add unique constraint to prevent future duplicates');
    console.log('5. 📝 Update trigger logic with better duplicate prevention');

  } catch (error) {
    console.error('❌ Error analyzing duplicates:', error);
  }
}

// Run the analysis
analyzeDuplicateMilestones();
