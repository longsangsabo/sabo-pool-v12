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

async function fixMissingMilestones() {
  try {
    console.log('🔧 Fixing missing rank registration milestones...\n');

    // Find the rank registration milestone
    const { data: rankMilestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('name', 'Đăng ký hạng thành công')
      .single();

    if (milestoneError) {
      console.error('Error finding rank milestone:', milestoneError);
      return;
    }

    console.log('Found rank registration milestone:', rankMilestone);

    // Find recent approved users who don't have the milestone
    const { data: recentApprovals, error: approvalsError } = await supabase
      .from('rank_requests')
      .select('*')
      .eq('status', 'approved')
      .gte('updated_at', '2025-08-21T00:00:00Z')
      .order('updated_at', { ascending: false });

    if (approvalsError) {
      console.error('Error fetching recent approvals:', approvalsError);
      return;
    }

    console.log(`\nFound ${recentApprovals.length} recent approvals to check...\n`);

    const usersToFix = [];

    for (const approval of recentApprovals) {
      // Check if user already has rank registration milestone
      const { data: existingAward, error: existingError } = await supabase
        .from('milestone_awards')
        .select('*')
        .eq('player_id', approval.user_id)
        .eq('milestone_id', rankMilestone.id)
        .eq('event_type', 'rank_registration');

      if (existingError) {
        console.error(`Error checking existing awards for ${approval.user_id}:`, existingError);
        continue;
      }

      if (existingAward.length === 0) {
        console.log(`❌ User ${approval.user_id} missing rank registration milestone`);
        usersToFix.push(approval);
      } else {
        console.log(`✅ User ${approval.user_id} already has rank registration milestone`);
      }
    }

    console.log(`\n🔧 Need to fix ${usersToFix.length} users...\n`);

    // Fix missing milestones
    for (const approval of usersToFix) {
      console.log(`Awarding milestone to user ${approval.user_id}...`);

      try {
        // Try to use the award_milestone_spa function
        const { data: awardResult, error: awardError } = await supabase.rpc('award_milestone_spa', {
          p_player_id: approval.user_id,
          p_milestone_id: rankMilestone.id,
          p_event_type: 'rank_registration'
        });

        if (awardError) {
          console.log(`Function failed, trying direct insert: ${awardError.message}`);
          
          // Direct insert into milestone_awards
          const { data: insertResult, error: insertError } = await supabase
            .from('milestone_awards')
            .insert({
              player_id: approval.user_id,
              milestone_id: rankMilestone.id,
              event_type: 'rank_registration',
              spa_points_awarded: rankMilestone.spa_reward,
              occurrence: 1,
              status: 'success',
              awarded_at: new Date().toISOString()
            });

          if (insertError) {
            console.error(`Failed to insert milestone for ${approval.user_id}:`, insertError);
          } else {
            console.log(`✅ Manually inserted milestone for ${approval.user_id}`);
            
            // Update user's SPA points
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('spa_points, player_id')
              .eq('user_id', approval.user_id)
              .single();

            if (!profileError && profile) {
              const newSpaPoints = (profile.spa_points || 0) + rankMilestone.spa_reward;
              
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ spa_points: newSpaPoints })
                .eq('user_id', approval.user_id);

              if (updateError) {
                console.error(`Failed to update SPA points for ${approval.user_id}:`, updateError);
              } else {
                console.log(`✅ Updated SPA points: ${profile.spa_points} -> ${newSpaPoints}`);
              }
            }
          }
        } else {
          console.log(`✅ Function success for ${approval.user_id}:`, awardResult);
        }
      } catch (error) {
        console.error(`Error awarding milestone to ${approval.user_id}:`, error);
      }
    }

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...\n');
    for (const approval of usersToFix) {
      const { data: verifyAward, error: verifyError } = await supabase
        .from('milestone_awards')
        .select('*')
        .eq('player_id', approval.user_id)
        .eq('milestone_id', rankMilestone.id)
        .eq('event_type', 'rank_registration');

      if (verifyError) {
        console.error(`Error verifying ${approval.user_id}:`, verifyError);
      } else if (verifyAward.length > 0) {
        console.log(`✅ User ${approval.user_id} now has rank registration milestone`);
      } else {
        console.log(`❌ User ${approval.user_id} still missing milestone`);
      }
    }

    console.log('\n✅ Milestone fix completed!');

  } catch (error) {
    console.error('❌ Error fixing milestones:', error);
  }
}

// Run the fix
fixMissingMilestones();
