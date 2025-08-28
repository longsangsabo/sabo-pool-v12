const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentUser() {
  try {
    console.log('🔍 CHECKING CURRENT USER DATA');
    console.log('=============================\n');
    
    // Find user with 350 SPA balance
    const { data: userRanking } = await supabase
      .from('player_rankings')
      .select(`
        user_id,
        spa_balance,
        profiles!inner(email, full_name)
      `)
      .eq('spa_balance', 350)
      .limit(1)
      .single();
    
    if (!userRanking) {
      console.log('❌ No user found with 350 SPA balance');
      return;
    }
    
    const user = userRanking.profiles;
    console.log(`👤 User: ${user.full_name} (${user.email})`);
    console.log(`💰 SPA Balance: ${userRanking.spa_balance}`);
    
    // Check SPA transactions for this user
    const { data: transactions } = await supabase
      .from('spa_transactions')
      .select('*')
      .eq('user_id', userRanking.user_id)
      .order('created_at', { ascending: false });
    
    console.log(`\n💳 SPA Transactions (${transactions?.length || 0}):`);
    if (transactions && transactions.length > 0) {
      transactions.forEach(t => {
        console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description} (${new Date(t.created_at).toLocaleString()})`);
      });
    } else {
      console.log('   ❌ NO SPA TRANSACTIONS FOUND! This is the problem.');
    }
    
    // Check notifications for this user
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userRanking.user_id)
      .order('created_at', { ascending: false });
    
    console.log(`\n🔔 Notifications (${notifications?.length || 0}):`);
    if (notifications && notifications.length > 0) {
      notifications.forEach(n => {
        console.log(`   📢 ${n.title} - ${n.message} (${new Date(n.created_at).toLocaleString()})`);
      });
    } else {
      console.log('   ❌ NO NOTIFICATIONS FOUND! This is the problem.');
    }
    
    // Check completed milestones for this user
    const { data: completedMilestones } = await supabase
      .from('player_milestones')
      .select(`
        *,
        milestones!inner(name, spa_reward, description)
      `)
      .eq('user_id', userRanking.user_id)
      .eq('completed', true)
      .order('completed_at', { ascending: false });
    
    console.log(`\n🎯 Completed Milestones (${completedMilestones?.length || 0}):`);
    if (completedMilestones && completedMilestones.length > 0) {
      completedMilestones.forEach(m => {
        console.log(`   ✅ ${m.milestones.name} (+${m.milestones.spa_reward} SPA) - ${new Date(m.completed_at).toLocaleString()}`);
      });
      
      // Calculate expected total SPA
      const expectedSPA = completedMilestones.reduce((sum, m) => sum + (m.milestones.spa_reward || 0), 0);
      console.log(`\n📊 ANALYSIS:`);
      console.log(`   Expected SPA from milestones: ${expectedSPA}`);
      console.log(`   Actual SPA balance: ${userRanking.spa_balance}`);
      console.log(`   SPA transactions found: ${transactions?.length || 0}`);
      console.log(`   Notifications found: ${notifications?.length || 0}`);
      
      if (expectedSPA === userRanking.spa_balance && (transactions?.length || 0) === 0) {
        console.log(`\n🚨 ROOT CAUSE: SPA balance is correct BUT no transactions/notifications were created!`);
        console.log(`   - User completed milestones and got SPA balance updated directly`);
        console.log(`   - But milestoneService.ts is not creating spa_transactions or notifications`);
        console.log(`   - Need to check if milestoneService.ts is actually being called`);
      }
    } else {
      console.log('   ❌ NO COMPLETED MILESTONES FOUND!');
      console.log(`\n🚨 MYSTERY: User has 350 SPA but no completed milestones in database!`);
    }
    
    return userRanking.user_id;
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCurrentUser();
