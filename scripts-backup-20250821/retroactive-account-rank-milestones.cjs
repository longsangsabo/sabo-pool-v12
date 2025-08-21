#!/usr/bin/env node
/**
 * Retroactive Milestone Award Script
 * Focus: Account Creation & Rank Registration milestones
 * Award SPA for users who completed these but haven't received rewards yet
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function awardAccountAndRankMilestones() {
  try {
    console.log('=== RETROACTIVE MILESTONE AWARD: ACCOUNT & RANK ===\n');

    // 1. Get the specific milestone IDs we want to award
    const { data: milestones, error: milestoneError } = await supabase
      .from('milestones')
      .select('id, name, milestone_type, spa_reward')
      .in('milestone_type', ['account_creation', 'rank_registration']);

    if (milestoneError) {
      throw milestoneError;
    }

    if (!milestones || milestones.length === 0) {
      console.log('❌ Không tìm thấy milestone account_creation hoặc rank_registration');
      return;
    }

    console.log('🎯 Target milestones:');
    milestones.forEach(m => {
      console.log(`   - ${m.name} (${m.milestone_type}): ${m.spa_reward} SPA`);
    });

    const accountMilestone = milestones.find(m => m.milestone_type === 'account_creation');
    const rankMilestone = milestones.find(m => m.milestone_type === 'rank_registration');

    // 2. Get all users who have accounts (everyone should get account milestone)
    const { data: allUsers, error: userError } = await supabase
      .from('profiles')
      .select('user_id, display_name, created_at');

    if (userError) {
      throw userError;
    }

    console.log(`\n👥 Found ${allUsers?.length || 0} total users`);

    // 3. Get users who have verified ranks (should get rank milestone)
    const { data: rankedUsers, error: rankError } = await supabase
      .from('profiles')
      .select('user_id, display_name, verified_rank')
      .not('verified_rank', 'is', null);

    if (rankError) {
      throw rankError;
    }

    console.log(`🏆 Found ${rankedUsers?.length || 0} users with verified ranks`);

    // 4. Check existing milestone awards to avoid duplicates
    const { data: existingMilestones, error: existingError } = await supabase
      .from('player_milestones')
      .select('player_id, milestone_id, is_completed')
      .in('milestone_id', milestones.map(m => m.id));

    if (existingError) {
      throw existingError;
    }

    console.log(`📋 Found ${existingMilestones?.length || 0} existing milestone records`);

    let accountAwards = 0;
    let rankAwards = 0;
    let totalSpaAwarded = 0;

    // 5. Award Account Creation milestone to all users who don't have it completed
    if (accountMilestone && allUsers) {
      console.log('\n🏗️  Processing Account Creation milestones...');
      
      for (const user of allUsers) {
        // Check if user already has this milestone completed
        const existing = existingMilestones?.find(
          em => em.player_id === user.user_id && 
                em.milestone_id === accountMilestone.id && 
                em.is_completed
        );

        if (!existing) {
          try {
            // Award the milestone
            const { error: insertError } = await supabase
              .from('player_milestones')
              .upsert({
                player_id: user.user_id,
                milestone_id: accountMilestone.id,
                current_progress: 1,
                is_completed: true,
                completed_at: new Date().toISOString(),
                times_completed: 1,
                user_name: user.display_name
              });

            if (insertError) {
              console.log(`   ❌ Error inserting milestone for ${user.display_name}: ${insertError.message}`);
              continue;
            }

            // Award SPA points using the correct function
            const { error: spaError } = await supabase.rpc('update_spa_points', {
              p_user_id: user.user_id,
              p_points: accountMilestone.spa_reward,
              p_source_type: 'milestone_reward',
              p_description: `Milestone: ${accountMilestone.name}`,
              p_transaction_type: 'credit'
            });

            if (spaError) {
              console.log(`   ❌ Error awarding SPA for ${user.display_name}: ${spaError.message}`);
              continue;
            }

            console.log(`   ✅ ${user.display_name}: +${accountMilestone.spa_reward} SPA (Account Creation)`);
            accountAwards++;
            totalSpaAwarded += accountMilestone.spa_reward;

          } catch (error) {
            console.log(`   ❌ Error processing ${user.display_name}: ${error.message}`);
          }
        }
      }
    }

    // 6. Award Rank Registration milestone to users with verified ranks
    if (rankMilestone && rankedUsers) {
      console.log('\n🏆 Processing Rank Registration milestones...');
      
      for (const user of rankedUsers) {
        // Check if user already has this milestone completed
        const existing = existingMilestones?.find(
          em => em.player_id === user.user_id && 
                em.milestone_id === rankMilestone.id && 
                em.is_completed
        );

        if (!existing) {
          try {
            // Award the milestone
            const { error: insertError } = await supabase
              .from('player_milestones')
              .upsert({
                player_id: user.user_id,
                milestone_id: rankMilestone.id,
                current_progress: 1,
                is_completed: true,
                completed_at: new Date().toISOString(),
                times_completed: 1,
                user_name: user.display_name
              });

            if (insertError) {
              console.log(`   ❌ Error inserting milestone for ${user.display_name}: ${insertError.message}`);
              continue;
            }

            // Award SPA points
            const { error: spaError } = await supabase.rpc('update_spa_points', {
              p_user_id: user.user_id,
              p_points: rankMilestone.spa_reward,
              p_source_type: 'milestone_reward',
              p_description: `Milestone: ${rankMilestone.name} (${user.verified_rank})`,
              p_transaction_type: 'credit'
            });

            if (spaError) {
              console.log(`   ❌ Error awarding SPA for ${user.display_name}: ${spaError.message}`);
              continue;
            }

            console.log(`   ✅ ${user.display_name} (${user.verified_rank}): +${rankMilestone.spa_reward} SPA (Rank Registration)`);
            rankAwards++;
            totalSpaAwarded += rankMilestone.spa_reward;

          } catch (error) {
            console.log(`   ❌ Error processing ${user.display_name}: ${error.message}`);
          }
        }
      }
    }

    // 7. Summary
    console.log('\n=== SUMMARY ===');
    console.log(`🏗️  Account Creation milestone awarded: ${accountAwards} users`);
    console.log(`🏆 Rank Registration milestone awarded: ${rankAwards} users`);
    console.log(`💰 Total SPA awarded: ${totalSpaAwarded} SPA`);
    console.log(`✅ Process completed successfully!`);

  } catch (error) {
    console.error('❌ Error in retroactive milestone award:', error);
  }
}

// Run the script
awardAccountAndRankMilestones();
