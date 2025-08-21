const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleHealthCheck() {
  try {
    console.log('🔍 SIMPLE SYSTEM CHECK');
    console.log('====================\n');
    
    // Count completed milestones
    const { data: milestones } = await supabase
      .from('player_milestones')
      .select('id')
      .eq('completed', true);
    
    console.log(`📊 Total completed milestones: ${milestones?.length || 0}`);
    
    // Count SPA transactions
    const { data: transactions } = await supabase
      .from('spa_transactions')
      .select('id');
    
    console.log(`💳 Total SPA transactions: ${transactions?.length || 0}`);
    
    // Count notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id');
    
    console.log(`🔔 Total notifications: ${notifications?.length || 0}`);
    
    // Count users with SPA
    const { data: rankings } = await supabase
      .from('player_rankings')
      .select('spa_balance')
      .gt('spa_balance', 0);
    
    console.log(`💰 Users with SPA > 0: ${rankings?.length || 0}`);
    
    // Show sample data
    const { data: sampleTransactions } = await supabase
      .from('spa_transactions')
      .select('amount, description, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`\n💳 Recent transactions:`);
    sampleTransactions?.forEach(t => {
      console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description} (${new Date(t.created_at).toLocaleString()})`);
    });
    
    const { data: sampleNotifications } = await supabase
      .from('notifications')
      .select('title, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`\n🔔 Recent notifications:`);
    sampleNotifications?.forEach(n => {
      console.log(`   📢 ${n.title} (${new Date(n.created_at).toLocaleString()})`);
    });
    
    // Check coverage
    const milestoneCount = milestones?.length || 0;
    const transactionCount = transactions?.length || 0;
    const notificationCount = notifications?.length || 0;
    
    if (milestoneCount > 0) {
      const txCoverage = ((transactionCount / milestoneCount) * 100).toFixed(1);
      const notifCoverage = ((notificationCount / milestoneCount) * 100).toFixed(1);
      
      console.log(`\n📈 MIGRATION SUCCESS RATE:`);
      console.log(`   SPA Transactions: ${txCoverage}% coverage`);
      console.log(`   Notifications: ${notifCoverage}% coverage`);
      
      if (txCoverage >= 90 && notifCoverage >= 90) {
        console.log(`\n🎉 MIGRATION SUCCESSFUL! System is working properly.`);
      } else {
        console.log(`\n⚠️  Need to investigate missing transactions/notifications.`);
      }
    } else {
      console.log(`\n❌ No completed milestones found. Check database connection.`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simpleHealthCheck();
