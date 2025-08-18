const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUserMilestoneStatus() {
  console.log('📊 CHECKING USER MILESTONE STATUS');
  console.log('================================');
  console.log('');

  try {
    console.log('1. 👥 ANALYZING USER MILESTONE COVERAGE...');
    
    // Get total users
    const { data: allUsers, error: usersError } = await supabase
      .from('player_rankings')
      .select('user_id, spa_points, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }

    // Get users with milestone progress
    const { data: usersWithMilestones, error: milestonesError } = await supabase
      .from('player_milestones')
      .select('player_id, milestone_id, is_completed, milestones(name, milestone_type, spa_reward)')
      .eq('is_completed', true);

    if (milestonesError) {
      console.log('❌ Error fetching milestone progress:', milestonesError.message);
      return;
    }

    const totalUsers = allUsers?.length || 0;
    const usersWithProgress = new Set(usersWithMilestones?.map(um => um.player_id)).size;
    const usersWithoutProgress = totalUsers - usersWithProgress;

    console.log(`📈 USER MILESTONE STATISTICS:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with milestone progress: ${usersWithProgress}`);
    console.log(`   Users WITHOUT milestone progress: ${usersWithoutProgress}`);
    console.log(`   Coverage: ${totalUsers > 0 ? Math.round((usersWithProgress / totalUsers) * 100) : 0}%`);
    console.log('');

    if (usersWithoutProgress > 0) {
      console.log('🚨 USERS MISSING MILESTONE PROGRESS:');
      console.log('');
      
      const userIdsWithMilestones = new Set(usersWithMilestones?.map(um => um.player_id));
      const usersNeedingMilestones = allUsers.filter(user => !userIdsWithMilestones.has(user.user_id));
      
      usersNeedingMilestones.slice(0, 10).forEach((user, index) => {
        console.log(`   ${index + 1}. User: ${user.user_id.slice(0, 8)}... | SPA: ${user.spa_points || 0} | Created: ${new Date(user.created_at).toLocaleDateString()}`);
      });
      
      if (usersNeedingMilestones.length > 10) {
        console.log(`   ... and ${usersNeedingMilestones.length - 10} more users`);
      }
      console.log('');
    }

    console.log('2. 🏆 ANALYZING MILESTONE COMPLETION RATES...');
    
    // Get available milestones
    const { data: availableMilestones, error: availableError } = await supabase
      .from('milestones')
      .select('*')
      .eq('is_active', true)
      .in('milestone_type', ['account_creation', 'rank_registration'])
      .order('spa_reward', { ascending: true });

    if (availableError) {
      console.log('❌ Error fetching available milestones:', availableError.message);
      return;
    }

    console.log(`📋 RETROACTIVE MILESTONE ANALYSIS:`);
    availableMilestones?.forEach(milestone => {
      const completions = usersWithMilestones?.filter(um => 
        um.milestone_id === milestone.id && um.is_completed
      ).length || 0;
      
      const eligibleUsers = milestone.milestone_type === 'account_creation' 
        ? totalUsers 
        : allUsers.filter(u => u.spa_points !== null).length;
      
      const completionRate = eligibleUsers > 0 ? Math.round((completions / eligibleUsers) * 100) : 0;
      
      console.log(`   • ${milestone.name}:`);
      console.log(`     Type: ${milestone.milestone_type}`);
      console.log(`     Reward: ${milestone.spa_reward} SPA`);
      console.log(`     Completions: ${completions}/${eligibleUsers} (${completionRate}%)`);
      console.log(`     Missing: ${eligibleUsers - completions} users`);
      console.log('');
    });

    console.log('3. 💰 POTENTIAL SPA IMPACT CALCULATION...');
    
    let potentialSpaForAccountCreation = 0;
    let potentialSpaForRankRegistration = 0;
    
    const accountCreationMilestone = availableMilestones?.find(m => m.milestone_type === 'account_creation');
    const rankRegistrationMilestone = availableMilestones?.find(m => m.milestone_type === 'rank_registration');
    
    if (accountCreationMilestone) {
      const completions = usersWithMilestones?.filter(um => 
        um.milestone_id === accountCreationMilestone.id && um.is_completed
      ).length || 0;
      const missing = totalUsers - completions;
      potentialSpaForAccountCreation = missing * accountCreationMilestone.spa_reward;
      
      console.log(`🎯 Account Creation Milestone:`);
      console.log(`   Users missing: ${missing}`);
      console.log(`   SPA per award: ${accountCreationMilestone.spa_reward}`);
      console.log(`   Total potential SPA: ${potentialSpaForAccountCreation}`);
      console.log('');
    }
    
    if (rankRegistrationMilestone) {
      const eligibleUsers = allUsers.filter(u => u.spa_points !== null).length;
      const completions = usersWithMilestones?.filter(um => 
        um.milestone_id === rankRegistrationMilestone.id && um.is_completed
      ).length || 0;
      const missing = eligibleUsers - completions;
      potentialSpaForRankRegistration = missing * rankRegistrationMilestone.spa_reward;
      
      console.log(`📊 Rank Registration Milestone:`);
      console.log(`   Eligible users: ${eligibleUsers}`);
      console.log(`   Users missing: ${missing}`);
      console.log(`   SPA per award: ${rankRegistrationMilestone.spa_reward}`);
      console.log(`   Total potential SPA: ${potentialSpaForRankRegistration}`);
      console.log('');
    }

    const totalPotentialSpa = potentialSpaForAccountCreation + potentialSpaForRankRegistration;
    
    console.log('💎 TOTAL IMPACT SUMMARY:');
    console.log('========================');
    console.log(`💰 Total potential SPA to award: ${totalPotentialSpa}`);
    console.log(`👥 Users needing retroactive awards: ${usersWithoutProgress}`);
    console.log(`🏆 Average SPA per user: ${usersWithoutProgress > 0 ? Math.round(totalPotentialSpa / usersWithoutProgress) : 0}`);
    console.log('');

    if (usersWithoutProgress > 0) {
      console.log('🔧 RECOMMENDED ACTION:');
      console.log('');
      console.log('📋 TO FIX THIS ISSUE:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Copy content from retroactive-milestone-spa-award.sql');
      console.log('3. Paste and run the SQL script');
      console.log('4. The script will:');
      console.log('   ✅ Create milestone progress records for existing users');
      console.log('   ✅ Award appropriate SPA retroactively');
      console.log('   ✅ Create notifications for milestone completions');
      console.log('   ✅ Ensure future milestones work normally');
      console.log('');
      console.log('🎯 EXPECTED RESULTS:');
      console.log(`   • ${usersWithoutProgress} users will receive milestone notifications`);
      console.log(`   • ${totalPotentialSpa} SPA will be distributed`);
      console.log(`   • Milestone system will be fully functional for all users`);
      console.log(`   • Badge sync issues should be resolved`);
    } else {
      console.log('✅ ALL USERS HAVE MILESTONE PROGRESS!');
      console.log('No retroactive awards needed.');
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

checkUserMilestoneStatus();
