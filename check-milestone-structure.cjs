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

async function checkMilestoneStructure() {
  try {
    console.log('🔍 Checking milestone system structure and triggers...\n');

    // 1. Check milestones table structure
    console.log('1. Checking milestones table structure...');
    const { data: milestoneSample, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .limit(5);

    if (milestoneError) {
      console.error('Error checking milestones:', milestoneError);
    } else if (milestoneSample && milestoneSample.length > 0) {
      console.log('Milestones table columns:');
      Object.keys(milestoneSample[0]).forEach(column => {
        console.log(`- ${column}: ${typeof milestoneSample[0][column]}`);
      });
      
      console.log('\nAll milestones:');
      milestoneSample.forEach(milestone => {
        console.log(`- ID: ${milestone.id}, Name: ${milestone.name}, SPA: ${milestone.spa_reward}`);
      });
    }

    // 2. Get all milestones to see if rank registration exists
    console.log('\n2. Getting all milestones...');
    const { data: allMilestones, error: allMilestonesError } = await supabase
      .from('milestones')
      .select('*')
      .order('created_at', { ascending: false });

    if (allMilestonesError) {
      console.error('Error fetching all milestones:', allMilestonesError);
    } else {
      console.log('All milestones in system:');
      allMilestones.forEach(milestone => {
        console.log(`- ID: ${milestone.id}`);
        console.log(`  Name: ${milestone.name}`);
        console.log(`  Description: ${milestone.description}`);
        console.log(`  SPA Reward: ${milestone.spa_reward}`);
        console.log(`  Created: ${milestone.created_at}`);
        console.log('---');
      });
    }

    // 3. Check what triggers exist for rank approval
    console.log('\n3. Looking for triggers on rank_requests table...');
    
    // Check if there are any triggers by trying to see recent milestone awards
    const { data: recentAwards, error: recentAwardsError } = await supabase
      .from('milestone_awards')
      .select('*')
      .eq('event_type', 'rank_registration')
      .order('awarded_at', { ascending: false })
      .limit(10);

    if (recentAwardsError) {
      console.error('Error fetching rank registration awards:', recentAwardsError);
    } else {
      console.log(`Found ${recentAwards.length} rank registration milestone awards:`);
      recentAwards.forEach(award => {
        console.log(`- Player: ${award.player_id}, SPA: ${award.spa_points_awarded}, Date: ${award.awarded_at}`);
      });
    }

    // 4. Check recent rank approvals vs milestone awards
    console.log('\n4. Comparing recent rank approvals with milestone awards...');
    const { data: recentApprovals, error: approvalsError } = await supabase
      .from('rank_requests')
      .select('*')
      .eq('status', 'approved')
      .gte('updated_at', '2025-08-21T00:00:00Z') // Today's approvals
      .order('updated_at', { ascending: false });

    if (approvalsError) {
      console.error('Error fetching recent approvals:', approvalsError);
    } else {
      console.log(`Found ${recentApprovals.length} recent rank approvals:`);
      
      for (const approval of recentApprovals) {
        console.log(`\n📋 Checking approval for user ${approval.user_id}:`);
        console.log(`  - Request ID: ${approval.id}`);
        console.log(`  - Approved at: ${approval.updated_at}`);
        
        // Check if this user got rank registration milestone
        const { data: userRankAwards, error: userRankAwardsError } = await supabase
          .from('milestone_awards')
          .select('*')
          .eq('player_id', approval.user_id)
          .eq('event_type', 'rank_registration');

        if (userRankAwardsError) {
          console.error(`  ❌ Error checking rank awards: ${userRankAwardsError.message}`);
        } else {
          console.log(`  📊 Rank registration awards: ${userRankAwards.length}`);
          userRankAwards.forEach(award => {
            console.log(`    - Awarded: ${award.awarded_at}, SPA: ${award.spa_points_awarded}`);
          });
        }

        // Check all milestone awards for this user
        const { data: allUserAwards, error: allUserAwardsError } = await supabase
          .from('milestone_awards')
          .select('*')
          .eq('player_id', approval.user_id)
          .order('awarded_at', { ascending: false });

        if (allUserAwardsError) {
          console.error(`  ❌ Error checking all awards: ${allUserAwardsError.message}`);
        } else {
          console.log(`  🏆 Total milestone awards: ${allUserAwards.length}`);
          allUserAwards.forEach(award => {
            console.log(`    - ${award.event_type}: ${award.spa_points_awarded} SPA at ${award.awarded_at}`);
          });
        }
      }
    }

    // 5. Test milestone awarding function with real data
    console.log('\n5. Testing milestone awarding function...');
    
    if (allMilestones && allMilestones.length > 0 && recentApprovals && recentApprovals.length > 0) {
      // Find rank registration milestone
      const rankMilestone = allMilestones.find(m => 
        m.name.toLowerCase().includes('rank') || 
        m.description.toLowerCase().includes('rank')
      );

      if (rankMilestone) {
        console.log(`Found potential rank milestone: ${rankMilestone.name} (ID: ${rankMilestone.id})`);
        
        // Try to award it manually to the most recent approval
        const testUser = recentApprovals[0];
        console.log(`Testing milestone award for user: ${testUser.user_id}`);
        
        try {
          const { data: awardResult, error: awardError } = await supabase.rpc('award_milestone_spa', {
            p_player_id: testUser.user_id,
            p_milestone_id: rankMilestone.id,
            p_event_type: 'rank_registration'
          });

          if (awardError) {
            console.log(`Award function error: ${awardError.message}`);
          } else {
            console.log(`Award function result:`, awardResult);
          }
        } catch (error) {
          console.log(`Award function test failed: ${error.message}`);
        }
      } else {
        console.log('❌ No rank-related milestone found!');
      }
    }

    console.log('\n✅ Milestone structure check completed!');

  } catch (error) {
    console.error('❌ Error checking milestone structure:', error);
  }
}

// Run the check
checkMilestoneStructure();
