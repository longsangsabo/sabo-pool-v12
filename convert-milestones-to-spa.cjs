#!/usr/bin/env node
/**
 * CRITICAL: Convert Completed Milestones to SPA Transactions
 * Award actual SPA to users who have completed milestones but haven't received SPA yet
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function convertMilestonesToSpaTransactions() {
  try {
    console.log('=== CONVERTING MILESTONES TO SPA TRANSACTIONS ===\n');

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
      .select('user_id, description, reference_id')
      .eq('source_type', 'milestone_reward');

    if (transactionError) {
      throw transactionError;
    }

    console.log(`💳 Found ${existingTransactions?.length || 0} existing milestone transactions`);

    // Create a set of existing transactions for quick lookup
    const existingSet = new Set();
    existingTransactions?.forEach(et => {
      // Create unique key: user_id + milestone_id or description
      const key = `${et.user_id}_${et.reference_id || et.description}`;
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
        // Award SPA using the update_spa_points function
        const { error: spaError } = await supabase.rpc('update_spa_points', {
          p_user_id: milestone.player_id,
          p_points: milestone.milestones.spa_reward,
          p_source_type: 'milestone_reward', 
          p_description: `Milestone: ${milestone.milestones.name}`,
          p_transaction_type: 'credit',
          p_reference_id: milestone.milestone_id,
          p_metadata: {
            milestone_id: milestone.milestone_id,
            milestone_type: milestone.milestones.milestone_type,
            completed_at: milestone.completed_at
          }
        });

        if (spaError) {
          console.log(`   ❌ ${milestone.user_name}: Error awarding SPA - ${spaError.message}`);
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

// Run the conversion
convertMilestonesToSpaTransactions();
