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

async function checkMilestoneSystem() {
  try {
    console.log('🔍 Checking milestone system for rank approval...\n');

    // 1. Check if milestone for rank registration exists
    console.log('1. Checking milestone definitions...');
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .ilike('name', '%rank%')
      .order('created_at', { ascending: false });

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      return;
    }

    console.log('Found rank-related milestones:');
    milestones.forEach(milestone => {
      console.log(`- ID: ${milestone.id}, Name: ${milestone.name}, SPA Reward: ${milestone.spa_reward}, Description: ${milestone.description}`);
    });

    // 2. Check milestone awards table structure
    console.log('\n2. Checking milestone_awards table structure...');
    const { data: sampleAwards, error: awardsError } = await supabase
      .from('milestone_awards')
      .select('*')
      .limit(5);

    if (awardsError) {
      console.error('Error fetching milestone awards:', awardsError);
    } else {
      console.log('Milestone awards table structure (sample):', sampleAwards);
    }

    // 3. Check for functions related to milestone awarding
    console.log('\n3. Checking milestone-related functions...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_function_list')
      .then(() => ({ data: [], error: null }))
      .catch(() => ({ data: [], error: 'Function check method not available' }));

    // Alternative method to check functions
    const { data: dbFunctions, error: dbError } = await supabase
      .from('pg_proc')
      .select('proname')
      .ilike('proname', '%milestone%')
      .then(() => ({ data: [], error: 'Cannot access pg_proc directly' }))
      .catch(() => ({ data: [], error: 'Cannot access pg_proc' }));

    // 4. Check triggers on rank_requests table
    console.log('\n4. Checking rank_requests table for recent approvals...');
    const { data: recentApprovals, error: approvalsError } = await supabase
      .from('rank_requests')
      .select('*')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (approvalsError) {
      console.error('Error fetching recent approvals:', approvalsError);
    } else {
      console.log('Recent approved rank requests:');
      recentApprovals.forEach(approval => {
        console.log(`- User: ${approval.user_id}, Rank: ${approval.rank}, Approved at: ${approval.updated_at}`);
      });

      // 5. Check if these users received milestone awards
      if (recentApprovals.length > 0) {
        console.log('\n5. Checking milestone awards for these users...');
        for (const approval of recentApprovals) {
          const { data: userAwards, error: userAwardsError } = await supabase
            .from('milestone_awards')
            .select('*, milestones(name, spa_reward)')
            .eq('user_id', approval.user_id)
            .order('created_at', { ascending: false });

          if (userAwardsError) {
            console.error(`Error fetching awards for user ${approval.user_id}:`, userAwardsError);
          } else {
            console.log(`User ${approval.user_id} milestone awards:`, userAwards);
          }
        }
      }
    }

    // 6. Try to execute milestone awarding function if it exists
    console.log('\n6. Testing milestone awarding functions...');
    
    // Check if award_milestone_spa function exists by trying to call it
    try {
      const testResult = await supabase.rpc('award_milestone_spa', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        p_milestone_id: 999999, // Non-existent milestone ID
        p_amount: 0
      });
      console.log('award_milestone_spa function exists but failed with test data (expected):', testResult.error?.message);
    } catch (error) {
      console.log('award_milestone_spa function may not exist or has different signature');
    }

    // 7. Check user profiles for SPA balance changes
    console.log('\n7. Checking user profiles for recent SPA changes...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, spa_balance, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      console.log('Recent profile updates:');
      profiles.forEach(profile => {
        console.log(`- ${profile.display_name}: SPA ${profile.spa_balance}, Updated: ${profile.updated_at}`);
      });
    }

    console.log('\n✅ Milestone system check completed!');

  } catch (error) {
    console.error('❌ Error checking milestone system:', error);
  }
}

// Run the check
checkMilestoneSystem();
