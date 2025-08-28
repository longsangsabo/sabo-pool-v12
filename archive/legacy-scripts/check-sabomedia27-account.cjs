const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkAccount() {
  console.log('🔍 Checking account: sabomedia27@gmail.com');
  
  // 1. Find user by email
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('user_id, email, full_name, created_at')
    .eq('email', 'sabomedia27@gmail.com');
    
  if (userError || !users || users.length === 0) {
    console.log('❌ User not found:', userError?.message || 'No matching email');
    return;
  }
  
  const user = users[0];
  const userId = user.user_id;
  
  console.log('✅ User found:');
  console.log('   ID:', userId);
  console.log('   Name:', user.full_name);
  console.log('   Created:', new Date(user.created_at).toLocaleString());
  
  // 2. Check milestone completions
  console.log('\n🏆 MILESTONE COMPLETIONS:');
  const { data: milestones, error: milestoneError } = await supabase
    .from('player_milestones')
    .select('*, milestones(name, spa_reward)')
    .eq('player_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false });
    
  if (milestoneError) {
    console.log('❌ Error:', milestoneError.message);
  } else if (milestones && milestones.length > 0) {
    let totalExpectedSpa = 0;
    milestones.forEach((m, i) => {
      totalExpectedSpa += m.milestones?.spa_reward || 0;
      console.log(`   ${i+1}. ${m.milestones?.name} - ${m.milestones?.spa_reward} SPA`);
      console.log(`      Completed: ${new Date(m.completed_at).toLocaleString()}`);
    });
    console.log(`   📊 Total expected SPA from milestones: ${totalExpectedSpa} SPA`);
  } else {
    console.log('   ❌ No completed milestones found');
  }
  
  // 3. Check SPA balance in player_rankings
  console.log('\n💰 SPA BALANCE IN PLAYER_RANKINGS:');
  const { data: ranking, error: rankingError } = await supabase
    .from('player_rankings')
    .select('spa_points, updated_at')
    .eq('user_id', userId)
    .single();
    
  if (rankingError) {
    console.log('❌ Error or no ranking record:', rankingError.message);
  } else {
    console.log(`   Balance: ${ranking?.spa_points || 0} SPA`);
    console.log(`   Updated: ${ranking?.updated_at ? new Date(ranking.updated_at).toLocaleString() : 'Never'}`);
  }
  
  // 4. Check SPA transactions
  console.log('\n💳 SPA TRANSACTIONS:');
  const { data: transactions, error: transError } = await supabase
    .from('spa_transactions')
    .select('amount, transaction_type, source_type, description, created_at, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (transError) {
    console.log('❌ Error:', transError.message);
  } else if (transactions && transactions.length > 0) {
    let totalTransactionSpa = 0;
    transactions.forEach((t, i) => {
      totalTransactionSpa += t.amount || 0;
      console.log(`   ${i+1}. ${t.transaction_type} - ${t.amount} SPA (${t.status})`);
      console.log(`      Source: ${t.source_type} - ${t.description}`);
      console.log(`      Date: ${new Date(t.created_at).toLocaleString()}`);
    });
    console.log(`   📊 Total SPA from transactions: ${totalTransactionSpa} SPA`);
  } else {
    console.log('   ❌ No SPA transactions found');
  }
  
  // 5. Check notifications
  console.log('\n🔔 NOTIFICATIONS:');
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('type, title, message, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (notifError) {
    console.log('❌ Error:', notifError.message);
  } else if (notifications && notifications.length > 0) {
    notifications.forEach((n, i) => {
      console.log(`   ${i+1}. ${n.type} - ${n.title}`);
      console.log(`      ${n.message}`);
      console.log(`      ${new Date(n.created_at).toLocaleString()}`);
    });
  } else {
    console.log('   ❌ No notifications found');
  }
  
  // 6. Summary analysis
  console.log('\n📋 ANALYSIS SUMMARY:');
  console.log('='.repeat(50));
  
  const milestoneCount = milestones?.length || 0;
  const totalExpectedSpa = milestones?.reduce((sum, m) => sum + (m.milestones?.spa_reward || 0), 0) || 0;
  const currentBalance = ranking?.spa_points || 0;
  const totalTransactionSpa = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const notificationCount = notifications?.length || 0;
  
  console.log(`   Completed milestones: ${milestoneCount}`);
  console.log(`   Expected SPA from milestones: ${totalExpectedSpa} SPA`);
  console.log(`   Current SPA balance: ${currentBalance} SPA`);
  console.log(`   Total SPA from transactions: ${totalTransactionSpa} SPA`);
  console.log(`   Notifications received: ${notificationCount}`);
  
  console.log('\n🚨 ISSUES DETECTED:');
  if (totalExpectedSpa > currentBalance) {
    console.log(`   ❌ SPA GAP: Missing ${totalExpectedSpa - currentBalance} SPA in balance`);
  }
  if (totalExpectedSpa > totalTransactionSpa) {
    console.log(`   ❌ TRANSACTION GAP: Missing ${totalExpectedSpa - totalTransactionSpa} SPA in transactions`);
  }
  if (milestoneCount > notificationCount && milestoneCount > 0) {
    console.log(`   ❌ NOTIFICATION GAP: Missing ${milestoneCount - notificationCount} milestone notifications`);
  }
  
  if (totalExpectedSpa === currentBalance && totalExpectedSpa === totalTransactionSpa) {
    console.log('   ✅ All systems in sync! No issues detected.');
  }
}

checkAccount().catch(console.error);
