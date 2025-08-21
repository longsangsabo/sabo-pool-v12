const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function resetUserSang() {
  try {
    console.log('=== RESET USER SANG ===');

    // Find user Sang
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('full_name', 'Sang')
      .single();

    if (!userProfile) {
      console.log('❌ User "Sang" not found');
      return;
    }

    const userId = userProfile.user_id;
    console.log(`👤 Found user: ${userProfile.full_name} (${userId.substring(0,8)}...)`);

    // 1. Reset milestones - delete milestone completions
    console.log('\n🔄 1. Resetting milestones...');
    const { error: milestonesError } = await supabase
      .from('user_milestone_progress')
      .delete()
      .eq('user_id', userId);

    if (milestonesError) {
      console.log('❌ Error resetting milestones:', milestonesError.message);
    } else {
      console.log('✅ Milestones reset successfully');
    }

    // 2. Delete SPA transactions
    console.log('\n🔄 2. Deleting SPA transactions...');
    const { error: transactionsError } = await supabase
      .from('spa_transactions')
      .delete()
      .eq('user_id', userId);

    if (transactionsError) {
      console.log('❌ Error deleting transactions:', transactionsError.message);
    } else {
      console.log('✅ SPA transactions deleted successfully');
    }

    // 3. Reset SPA balance in player_rankings
    console.log('\n🔄 3. Resetting SPA balance...');
    const { error: balanceError } = await supabase
      .from('player_rankings')
      .update({ 
        spa_points: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (balanceError) {
      console.log('❌ Error resetting balance:', balanceError.message);
    } else {
      console.log('✅ SPA balance reset to 0');
    }

    // 4. Reset wallet balance (if exists)
    console.log('\n🔄 4. Resetting wallet balance...');
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        points_balance: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (walletError) {
      console.log('⚠️ Wallet update error (may not exist):', walletError.message);
    } else {
      console.log('✅ Wallet balance reset to 0');
    }

    // 5. Delete milestone events for this user
    console.log('\n🔄 5. Deleting milestone events...');
    const { error: eventsError } = await supabase
      .from('milestone_events')
      .delete()
      .eq('player_id', userId);

    if (eventsError) {
      console.log('⚠️ Milestone events error (may not exist):', eventsError.message);
    } else {
      console.log('✅ Milestone events deleted');
    }

    // 6. Delete milestone awards
    console.log('\n🔄 6. Deleting milestone awards...');
    const { error: awardsError } = await supabase
      .from('milestone_awards')
      .delete()
      .eq('player_id', userId);

    if (awardsError) {
      console.log('⚠️ Milestone awards error (may not exist):', awardsError.message);
    } else {
      console.log('✅ Milestone awards deleted');
    }

    // Verify reset
    console.log('\n📊 VERIFICATION:');
    
    // Check milestones
    const { data: remainingMilestones } = await supabase
      .from('user_milestone_progress')
      .select('*')
      .eq('user_id', userId);
    
    console.log(`   Milestones remaining: ${remainingMilestones?.length || 0}`);

    // Check transactions
    const { data: remainingTransactions } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userId);
    
    console.log(`   Transactions remaining: ${remainingTransactions?.length || 0}`);

    // Check balance
    const { data: currentBalance } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', userId)
      .single();
    
    console.log(`   Current SPA balance: ${currentBalance?.spa_points || 0} SPA`);

    console.log('\n🎉 User "Sang" has been completely reset!');
    console.log('📝 Now you can test milestone system from the beginning:');
    console.log('   1. Account creation milestone');
    console.log('   2. Avatar upload milestone');  
    console.log('   3. Rank registration milestone');
    console.log('   4. Other milestones...');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetUserSang();
