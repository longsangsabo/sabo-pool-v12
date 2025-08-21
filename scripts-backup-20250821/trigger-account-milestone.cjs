const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function triggerAccountCreationMilestone() {
  try {
    console.log('=== MANUAL TRIGGER ACCOUNT CREATION MILESTONE ===');

    // Find user Sang
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('full_name', 'Sang')
      .single();

    if (!userProfile) {
      console.log('❌ User Sang not found');
      return;
    }

    const userId = userProfile.user_id;
    console.log('👤 User: ' + userProfile.full_name + ' (' + userId.substring(0,8) + '...)');

    // Get account_creation milestone
    const { data: accountMilestone } = await supabase
      .from('milestones')
      .select('*')
      .eq('milestone_type', 'account_creation')
      .single();

    if (!accountMilestone) {
      console.log('❌ Account creation milestone not found');
      return;
    }

    console.log('🏆 Found milestone: ' + accountMilestone.name + ' (' + accountMilestone.spa_reward + ' SPA)');

    // Step 1: Initialize player milestone record
    console.log('\n1. 📝 Creating milestone progress record...');
    const { error: upsertError } = await supabase
      .from('player_milestones')
      .upsert({
        player_id: userId,
        milestone_id: accountMilestone.id,
        current_progress: 0,
        is_completed: false,
        times_completed: 0
      }, { 
        onConflict: 'player_id,milestone_id' 
      });

    if (upsertError) {
      console.log('❌ Error creating progress record:', upsertError.message);
      return;
    }
    console.log('✅ Progress record created');

    // Step 2: Complete the milestone
    console.log('\n2. 🎯 Completing milestone...');
    const { error: completionError } = await supabase
      .from('player_milestones')
      .update({
        current_progress: accountMilestone.requirement_value,
        is_completed: true,
        completed_at: new Date().toISOString(),
        times_completed: 1
      })
      .eq('player_id', userId)
      .eq('milestone_id', accountMilestone.id);

    if (completionError) {
      console.log('❌ Error completing milestone:', completionError.message);
      return;
    }
    console.log('✅ Milestone marked as completed');

    // Step 3: Award SPA via direct database update (since RPC failed)
    console.log('\n3. 💰 Awarding SPA...');
    
    // Get current balance
    const { data: currentBalance } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', userId)
      .single();

    const currentSpa = currentBalance?.spa_points || 0;
    const newBalance = currentSpa + accountMilestone.spa_reward;

    // Update balance
    const { error: balanceError } = await supabase
      .from('player_rankings')
      .update({ 
        spa_points: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (balanceError) {
      console.log('❌ Error updating balance:', balanceError.message);
      return;
    }
    console.log('✅ SPA balance updated: ' + currentSpa + ' → ' + newBalance + ' SPA');

    // Step 4: Create SPA transaction record
    console.log('\n4. 📋 Creating transaction record...');
    const { error: transactionError } = await supabase
      .from('spa_transactions')
      .insert({
        user_id: userId,
        amount: accountMilestone.spa_reward,
        transaction_type: 'credit',
        source_type: 'milestone',
        description: 'Milestone: ' + accountMilestone.name,
        reference_id: accountMilestone.id,
        status: 'completed',
        user_name: userProfile.full_name
      });

    if (transactionError) {
      console.log('❌ Error creating transaction:', transactionError.message);
      return;
    }
    console.log('✅ Transaction record created');

    // Step 5: Create milestone award record
    console.log('\n5. 🏅 Creating award record...');
    const { error: awardError } = await supabase
      .from('milestone_awards')
      .insert({
        player_id: userId,
        milestone_id: accountMilestone.id,
        spa_points_awarded: accountMilestone.spa_reward,
        awarded_at: new Date().toISOString(),
        status: 'success'
      });

    if (awardError) {
      console.log('❌ Error creating award record:', awardError.message);
      return;
    }
    console.log('✅ Award record created');

    // Step 6: Create milestone event
    console.log('\n6. 📅 Creating milestone event...');
    const { error: eventError } = await supabase
      .from('milestone_events')
      .insert({
        player_id: userId,
        event_type: 'account_creation',
        event_context: { 
          milestone_id: accountMilestone.id,
          manually_triggered: true
        }
      });

    if (eventError) {
      console.log('❌ Error creating event:', eventError.message);
      return;
    }
    console.log('✅ Milestone event created');

    // Verification
    console.log('\n✅ VERIFICATION:');
    
    // Check final balance
    const { data: finalBalance } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', userId)
      .single();
    
    console.log('💰 Final SPA balance: ' + (finalBalance?.spa_points || 0) + ' SPA');

    // Check milestone completion
    const { data: milestoneStatus } = await supabase
      .from('player_milestones')
      .select('is_completed, completed_at')
      .eq('player_id', userId)
      .eq('milestone_id', accountMilestone.id)
      .single();
    
    console.log('🏆 Milestone completed: ' + (milestoneStatus?.is_completed ? 'YES' : 'NO'));
    if (milestoneStatus?.completed_at) {
      console.log('📅 Completed at: ' + milestoneStatus.completed_at);
    }

    console.log('\n🎉 ACCOUNT CREATION MILESTONE TRIGGERED SUCCESSFULLY!');
    console.log('User "Sang" should now see:');
    console.log('- SPA balance: ' + (finalBalance?.spa_points || 0) + ' SPA in profile');
    console.log('- Milestone completion in milestones page');
    console.log('- Transaction in SPA history');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

triggerAccountCreationMilestone();
