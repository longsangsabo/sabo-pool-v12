const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpecificUser() {
  try {
    console.log('=== KIỂM TRA USER CỤ THỂ ===');

    // Find a user with milestone transactions
    const { data: sampleTransaction } = await supabase
      .from('spa_transactions')
      .select('user_id, amount, description, source_type')
      .eq('source_type', 'milestone')
      .limit(1)
      .single();

    if (!sampleTransaction) {
      console.log('❌ No milestone transactions found');
      return;
    }

    const userId = sampleTransaction.user_id;
    console.log('👤 Checking user: ' + userId.substring(0,8) + '...');
    
    // Get all transactions for this user
    const { data: userTransactions } = await supabase
      .from('spa_transactions')
      .select('amount, description, source_type, transaction_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    // Get current balance
    const { data: userBalance } = await supabase
      .from('player_rankings')
      .select('spa_points, user_id')
      .eq('user_id', userId)
      .single();
    
    // Get user profile info
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single();
    
    console.log('📝 User: ' + (userProfile?.full_name || 'Unknown'));
    console.log('💰 Current balance: ' + (userBalance?.spa_points || 0) + ' SPA');
    console.log('');
    
    if (userTransactions && userTransactions.length > 0) {
      console.log('📋 Transaction history:');
      let runningTotal = 0;
      userTransactions.forEach((t, i) => {
        if (t.transaction_type === 'credit') {
          runningTotal += t.amount;
          console.log('   ' + (i+1) + '. +' + t.amount + ' SPA from ' + t.source_type + ' - ' + t.description);
        } else {
          runningTotal -= t.amount;
          console.log('   ' + (i+1) + '. -' + t.amount + ' SPA (' + t.transaction_type + ') - ' + t.description);
        }
        console.log('       Running total: ' + runningTotal + ' SPA');
      });
      
      console.log('');
      console.log('📊 Summary:');
      console.log('   Expected from transactions: ' + runningTotal + ' SPA');
      console.log('   Actual balance: ' + (userBalance?.spa_points || 0) + ' SPA');
      console.log('   Difference: ' + ((userBalance?.spa_points || 0) - runningTotal) + ' SPA');
    }

    // Also check what profile shows
    console.log('\n🔍 Profile SPA Display Check:');
    console.log('   SPA được hiển thị ở profile được lấy từ bảng player_rankings.spa_points');
    console.log('   Code ở spaService.ts -> getCurrentSPAPoints() -> player_rankings.spa_points');

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSpecificUser();
