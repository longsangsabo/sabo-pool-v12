const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function systemHealthCheck() {
  try {
    console.log('🔍 SYSTEM HEALTH CHECK AFTER MIGRATION');
    console.log('=====================================\n');
    
    // Check total completed milestones
    const { data: completedMilestones, count: totalCompleted } = await supabase
      .from('player_milestones')
      .select('*', { count: 'exact' })
      .eq('completed', true);
    
    console.log(`📊 Total completed milestones: ${totalCompleted}`);
    
    // Check milestones with transactions
    const { data: milestonesWithTransactions, count: withTransactions } = await supabase
      .from('player_milestones')
      .select(`
        *,
        spa_transactions!inner(*)
      `, { count: 'exact' })
      .eq('completed', true);
    
    console.log(`💳 Milestones with SPA transactions: ${withTransactions}`);
    
    // Check milestones with notifications
    const { data: milestonesWithNotifications, count: withNotifications } = await supabase
      .from('player_milestones')
      .select(`
        *,
        notifications!inner(*)
      `, { count: 'exact' })
      .eq('completed', true);
    
    console.log(`🔔 Milestones with notifications: ${withNotifications}`);
    
    // Calculate coverage
    const transactionCoverage = totalCompleted > 0 ? ((withTransactions / totalCompleted) * 100).toFixed(1) : 0;
    const notificationCoverage = totalCompleted > 0 ? ((withNotifications / totalCompleted) * 100).toFixed(1) : 0;
    
    console.log(`\n📈 Coverage:`);
    console.log(`   SPA Transactions: ${transactionCoverage}% (${withTransactions}/${totalCompleted})`);
    console.log(`   Notifications: ${notificationCoverage}% (${withNotifications}/${totalCompleted})`);
    
    // Check users with SPA balance > 0
    const { data: usersWithSPA, count: usersWithSPACount } = await supabase
      .from('player_rankings')
      .select('*', { count: 'exact' })
      .gt('spa_balance', 0);
    
    console.log(`\n💰 Users with SPA balance > 0: ${usersWithSPACount}`);
    
    // Sample recent transactions
    const { data: recentTransactions } = await supabase
      .from('spa_transactions')
      .select(`
        amount,
        description,
        created_at,
        profiles!inner(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log(`\n💳 Recent SPA Transactions (last 10):`);
    recentTransactions?.forEach(t => {
      console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.profiles.full_name} (${t.description}) - ${new Date(t.created_at).toLocaleString()}`);
    });
    
    // Sample recent notifications
    const { data: recentNotifications } = await supabase
      .from('notifications')
      .select(`
        title,
        message,
        created_at,
        profiles!inner(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log(`\n🔔 Recent Notifications (last 10):`);
    recentNotifications?.forEach(n => {
      console.log(`   📢 ${n.profiles.full_name}: ${n.title} - ${new Date(n.created_at).toLocaleString()}`);
    });
    
    // Check if system is working for new registrations
    console.log(`\n✅ MIGRATION STATUS:`);
    if (transactionCoverage >= 95 && notificationCoverage >= 95) {
      console.log(`🎉 SUCCESS: System is healthy. Coverage > 95%`);
    } else if (transactionCoverage >= 90 && notificationCoverage >= 90) {
      console.log(`⚠️  WARNING: Coverage is good but not perfect (${Math.min(transactionCoverage, notificationCoverage)}%)`);
    } else {
      console.log(`❌ ISSUE: Low coverage detected. Need to investigate.`);
    }
    
    console.log(`\n🚀 Next steps:`);
    console.log(`   1. Test new user registration → milestone completion → SPA award → notification`);
    console.log(`   2. Monitor for any new issues`);
    console.log(`   3. Users should now see correct SPA balances and notifications`);
    
  } catch (error) {
    console.error('❌ Error during health check:', error);
  }
}

systemHealthCheck();
