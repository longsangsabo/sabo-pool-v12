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

async function investigateMilestoneIssues() {
  try {
    console.log('🔍 Investigating milestone system issues...\n');

    // 1. Check actual table structure
    console.log('1. Checking milestone_awards table columns...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'milestone_awards' })
      .then(() => ({ data: null, error: 'Function not available' }))
      .catch(async () => {
        // Alternative: Try to get table structure by querying with limit 0
        const { data, error } = await supabase
          .from('milestone_awards')
          .select('*')
          .limit(0);
        return { data: 'checked via select', error };
      });

    // 2. Check what columns actually exist in milestone_awards
    console.log('\n2. Examining milestone_awards structure by sampling data...');
    const { data: sampleRecord, error: sampleError } = await supabase
      .from('milestone_awards')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error sampling milestone_awards:', sampleError);
    } else if (sampleRecord && sampleRecord.length > 0) {
      console.log('Columns in milestone_awards table:');
      Object.keys(sampleRecord[0]).forEach(column => {
        console.log(`- ${column}: ${typeof sampleRecord[0][column]}`);
      });
    }

    // 3. Check profiles table
    console.log('\n3. Checking profiles table...');
    const { data: profileSample, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.error('Error checking profiles table:', profileError);
    } else if (profileSample && profileSample.length > 0) {
      console.log('Profiles table columns:');
      Object.keys(profileSample[0]).forEach(column => {
        console.log(`- ${column}: ${typeof profileSample[0][column]}`);
      });
    }

    // 4. Look for milestone-related functions
    console.log('\n4. Testing different milestone function names...');
    
    const functionTests = [
      'award_milestone_spa',
      'award_milestone',
      'trigger_milestone',
      'check_milestone',
      'process_milestone'
    ];

    for (const funcName of functionTests) {
      try {
        const result = await supabase.rpc(funcName, {});
        console.log(`✅ Function ${funcName} exists (failed with empty params as expected)`);
      } catch (error) {
        if (error.message.includes('Could not find the function')) {
          console.log(`❌ Function ${funcName} does not exist`);
        } else {
          console.log(`✅ Function ${funcName} exists but failed: ${error.message}`);
        }
      }
    }

    // 5. Check recent rank approvals with correct column mapping
    console.log('\n5. Checking recent rank approvals and their milestone status...');
    const { data: recentApprovals, error: approvalsError } = await supabase
      .from('rank_requests')
      .select('*')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(3);

    if (approvalsError) {
      console.error('Error fetching recent approvals:', approvalsError);
    } else {
      console.log('Recent approved rank requests:');
      recentApprovals.forEach(approval => {
        console.log(`- User ID: ${approval.user_id}, Request ID: ${approval.id}, Status: ${approval.status}, Updated: ${approval.updated_at}`);
      });

      // 6. Check milestone awards using correct column name (player_id instead of user_id)
      if (recentApprovals.length > 0) {
        console.log('\n6. Checking milestone awards using player_id...');
        for (const approval of recentApprovals) {
          const { data: playerAwards, error: playerAwardsError } = await supabase
            .from('milestone_awards')
            .select('*')
            .eq('player_id', approval.user_id)
            .order('awarded_at', { ascending: false });

          if (playerAwardsError) {
            console.error(`Error fetching awards for player ${approval.user_id}:`, playerAwardsError);
          } else {
            console.log(`Player ${approval.user_id} has ${playerAwards.length} milestone awards:`);
            playerAwards.forEach(award => {
              console.log(`  - Event: ${award.event_type}, SPA: ${award.spa_points_awarded}, Date: ${award.awarded_at}`);
            });
          }
        }
      }
    }

    // 7. Check milestones table for rank-related milestones
    console.log('\n7. Looking for rank registration milestone...');
    const { data: rankMilestones, error: rankMilestonesError } = await supabase
      .from('milestones')
      .select('*')
      .or('event_type.eq.rank_registration,name.ilike.%rank%,description.ilike.%rank%');

    if (rankMilestonesError) {
      console.error('Error fetching rank milestones:', rankMilestonesError);
    } else {
      console.log('Rank-related milestones found:');
      rankMilestones.forEach(milestone => {
        console.log(`- ID: ${milestone.id}`);
        console.log(`  Name: ${milestone.name}`);
        console.log(`  Event Type: ${milestone.event_type}`);
        console.log(`  SPA Reward: ${milestone.spa_reward}`);
        console.log(`  Description: ${milestone.description}`);
        console.log('---');
      });
    }

    console.log('\n✅ Investigation completed!');

  } catch (error) {
    console.error('❌ Error investigating milestone system:', error);
  }
}

// Run the investigation
investigateMilestoneIssues();
