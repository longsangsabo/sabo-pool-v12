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

async function testMilestoneTrigger() {
  try {
    console.log('🧪 Testing milestone trigger system...\n');

    // 1. Check if functions exist
    console.log('1. Testing function existence...');
    
    try {
      const { data, error } = await supabase.rpc('award_milestone_spa', {
        p_player_id: '00000000-0000-0000-0000-000000000000',
        p_milestone_id: '00000000-0000-0000-0000-000000000000',
        p_event_type: 'test'
      });
      
      if (error) {
        if (error.message.includes('Could not find the function')) {
          console.log('❌ Function award_milestone_spa does not exist');
        } else {
          console.log('✅ Function award_milestone_spa exists (test failed as expected)');
        }
      } else {
        console.log('✅ Function award_milestone_spa exists and returned:', data);
      }
    } catch (error) {
      console.log('❌ Function test error:', error.message);
    }

    // 2. Check recent milestone awards
    console.log('\n2. Checking recent milestone awards...');
    const { data: recentAwards, error: awardsError } = await supabase
      .from('milestone_awards')
      .select('*')
      .eq('event_type', 'rank_registration')
      .order('awarded_at', { ascending: false })
      .limit(5);

    if (awardsError) {
      console.error('Error fetching recent awards:', awardsError);
    } else {
      console.log(`Found ${recentAwards.length} recent rank registration awards:`);
      recentAwards.forEach(award => {
        console.log(`- Player: ${award.player_id}, SPA: ${award.spa_points_awarded}, Date: ${award.awarded_at}`);
      });
    }

    // 3. Check users who need milestone but don't have it
    console.log('\n3. Checking for any remaining missing milestones...');
    
    const { data: allApprovals, error: approvalsError } = await supabase
      .from('rank_requests')
      .select('user_id, id, updated_at')
      .eq('status', 'approved')
      .gte('updated_at', '2025-08-21T00:00:00Z')
      .order('updated_at', { ascending: false });

    if (approvalsError) {
      console.error('Error fetching approvals:', approvalsError);
    } else {
      console.log(`Checking ${allApprovals.length} recent approvals for missing milestones...`);
      
      let missingCount = 0;
      for (const approval of allApprovals) {
        const { data: award, error: awardError } = await supabase
          .from('milestone_awards')
          .select('id')
          .eq('player_id', approval.user_id)
          .eq('event_type', 'rank_registration')
          .limit(1);

        if (awardError) {
          console.error(`Error checking ${approval.user_id}:`, awardError);
        } else if (award.length === 0) {
          console.log(`❌ User ${approval.user_id} still missing rank registration milestone`);
          missingCount++;
        }
      }
      
      if (missingCount === 0) {
        console.log('✅ All recent approvals have rank registration milestones!');
      } else {
        console.log(`❌ ${missingCount} users still missing milestones`);
      }
    }

    // 4. Test trigger by creating a test rank request (simulation)
    console.log('\n4. Testing trigger simulation...');
    console.log('Note: To fully test the trigger, approve a new rank request in the admin panel');
    console.log('The trigger should automatically award the milestone when status changes to "approved"');

    // 5. Check trigger existence (we can't directly query triggers but can test behavior)
    console.log('\n5. Recommendation for manual testing:');
    console.log('1. Go to admin panel and find a pending rank request');
    console.log('2. Approve it');
    console.log('3. Check if the user automatically receives the "Đăng ký hạng thành công" milestone');
    console.log('4. If not, the trigger needs to be manually created in Supabase Dashboard');

    console.log('\n✅ Milestone trigger test completed!');

  } catch (error) {
    console.error('❌ Error testing milestone trigger:', error);
  }
}

// Run the test
testMilestoneTrigger();
