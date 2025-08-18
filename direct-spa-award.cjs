#!/usr/bin/env node
/**
 * CRITICAL: Direct SPA Transaction Creation for Milestones
 * Award actual SPA to users by directly inserting transactions and updating balances
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function directSpaAward() {
  try {
    console.log('=== DIRECT SPA AWARD FOR MILESTONES ===\n');

    // 1. Get all completed milestones that don't have corresponding SPA transactions
    console.log('🔍 Finding completed milestones without SPA transactions...');
    
    const { data: completedMilestones, error: milestoneError } = await supabase
      .from('player_milestones')
      .select(`
        id,
        player_id,
        milestone_id,
        user_name,
        completed_at,
        milestones (
          id,
          name,
          spa_reward,
          milestone_type
        )
      `)
      .eq('is_completed', true)
      .order('completed_at', { ascending: true });

    if (milestoneError) {
      throw milestoneError;
    }

    console.log(`📊 Found ${completedMilestones?.length || 0} completed milestones`);

    if (!completedMilestones || completedMilestones.length === 0) {
      console.log('✅ No milestones to process');
      return;
    }

    // 2. Check existing milestone transactions to avoid duplicates
    const { data: existingTransactions, error: transactionError } = await supabase
      .from('spa_transactions')
      .select('user_id, reference_id')
      .eq('source_type', 'milestone_reward');

    if (transactionError) {
      throw transactionError;
    }

    console.log(`💳 Found ${existingTransactions?.length || 0} existing milestone transactions`);

    // Create a set of existing transactions for quick lookup
    const existingSet = new Set();
    existingTransactions?.forEach(et => {
      const key = `${et.user_id}_${et.reference_id}`;
      existingSet.add(key);
    });

    // 3. Process each completed milestone
    let processed = 0;
    let awarded = 0;
    let totalSpaAwarded = 0;
    let errors = 0;

    console.log('\n🚀 Processing milestones...\n');

    for (const milestone of completedMilestones) {
      processed++;
      
      if (!milestone.milestones) {
        console.log(`   ⚠️  Milestone ${milestone.id}: No milestone data found`);
        continue;
      }

      // Check if transaction already exists
      const transactionKey = `${milestone.player_id}_${milestone.milestone_id}`;
      if (existingSet.has(transactionKey)) {
        continue; // Skip if already exists
      }

      try {
        // Step 1: Insert SPA transaction
        const { error: transactionError } = await supabase
          .from('spa_transactions')
          .insert({
            user_id: milestone.player_id,
            amount: milestone.milestones.spa_reward,
            source_type: 'milestone_reward',
            transaction_type: 'credit',
            description: `Milestone: ${milestone.milestones.name}`,
            reference_id: milestone.milestone_id,
            status: 'completed',
            metadata: {
              milestone_id: milestone.milestone_id,
              milestone_type: milestone.milestones.milestone_type,
              completed_at: milestone.completed_at
            },
            created_at: new Date().toISOString()
          });

        if (transactionError) {
          console.log(`   ❌ ${milestone.user_name}: Transaction insert error - ${transactionError.message}`);
          errors++;
          continue;
        }

        // Step 2: Get current SPA balance and update
        const { data: currentRanking } = await supabase
          .from('player_rankings')
          .select('spa_points')
          .eq('player_id', milestone.player_id)
          .single();

        const currentSpa = currentRanking?.spa_points || 0;
        const newSpa = currentSpa + milestone.milestones.spa_reward;

        const { error: updateError } = await supabase
          .from('player_rankings')
          .update({ 
            spa_points: newSpa,
            updated_at: new Date().toISOString()
          })
          .eq('player_id', milestone.player_id);

        if (updateError) {
          console.log(`   ❌ ${milestone.user_name}: Balance update error - ${updateError.message}`);
          errors++;
          continue;
        }

        console.log(`   ✅ ${milestone.user_name}: +${milestone.milestones.spa_reward} SPA (${milestone.milestones.name})`);
        awarded++;
        totalSpaAwarded += milestone.milestones.spa_reward;

        // Add small delay to avoid overwhelming the database
        if (processed % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.log(`   ❌ ${milestone.user_name}: Exception - ${error.message}`);
        errors++;
      }
    }

    // 4. Summary
    console.log('\n=== SUMMARY ===');
    console.log(`📊 Total milestones processed: ${processed}`);
    console.log(`✅ SPA successfully awarded: ${awarded}`);
    console.log(`💰 Total SPA awarded: ${totalSpaAwarded} SPA`);
    console.log(`❌ Errors encountered: ${errors}`);
    console.log(`🎉 Process completed!`);

    // 5. Verification
    console.log('\n=== VERIFICATION ===');
    const { data: newTransactions } = await supabase
      .from('spa_transactions')
      .select('amount', { count: 'exact' })
      .eq('source_type', 'milestone_reward');

    let totalTransactionSpa = 0;
    newTransactions?.forEach(nt => {
      totalTransactionSpa += nt.amount || 0;
    });

    console.log(`💳 Total milestone transactions after: ${newTransactions?.length || 0}`);
    console.log(`💰 Total SPA in milestone transactions: ${totalTransactionSpa} SPA`);

  } catch (error) {
    console.error('❌ Critical error:', error);
  }
}

// Run the direct SPA award
directSpaAward();
