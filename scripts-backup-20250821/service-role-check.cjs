const { createClient } = require('@supabase/supabase-js');

// Use service role key for full access
const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function serviceRoleCheck() {
  try {
    console.log('🔍 CHECKING WITH SERVICE ROLE KEY');
    console.log('================================\n');
    
    // Test basic connection
    const { data: testQuery, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection error:', testError);
      return;
    }
    
    console.log('✅ Database connection successful\n');
    
    // Count completed milestones
    const { data: milestones } = await supabase
      .from('player_milestones')
      .select('id')
      .eq('completed', true);
    
    console.log(`📊 Total completed milestones: ${milestones?.length || 0}`);
    
    // Count SPA transactions
    const { data: transactions } = await supabase
      .from('spa_transactions')
      .select('id, amount, description, created_at');
    
    console.log(`💳 Total SPA transactions: ${transactions?.length || 0}`);
    
    // Count notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, title, created_at');
    
    console.log(`🔔 Total notifications: ${notifications?.length || 0}`);
    
    // Count users with SPA
    const { data: rankings } = await supabase
      .from('player_rankings')
      .select('spa_balance')
      .gt('spa_balance', 0);
    
    console.log(`💰 Users with SPA > 0: ${rankings?.length || 0}`);
    
    // Show sample data if available
    if (transactions && transactions.length > 0) {
      console.log(`\n💳 Sample SPA transactions:`);
      transactions.slice(0, 5).forEach(t => {
        console.log(`   ${t.amount > 0 ? '+' : ''}${t.amount} SPA - ${t.description} (${new Date(t.created_at).toLocaleString()})`);
      });
    }
    
    if (notifications && notifications.length > 0) {
      console.log(`\n🔔 Sample notifications:`);
      notifications.slice(0, 5).forEach(n => {
        console.log(`   📢 ${n.title} (${new Date(n.created_at).toLocaleString()})`);
      });
    }
    
    if (rankings && rankings.length > 0) {
      console.log(`\n💰 Sample SPA balances:`);
      rankings.slice(0, 5).forEach(r => {
        console.log(`   Balance: ${r.spa_balance} SPA`);
      });
    }
    
    // Final assessment
    const milestoneCount = milestones?.length || 0;
    const transactionCount = transactions?.length || 0;
    const notificationCount = notifications?.length || 0;
    
    console.log(`\n📊 MIGRATION ASSESSMENT:`);
    if (transactionCount > 200 && notificationCount > 200) {
      console.log(`🎉 MIGRATION SUCCESSFUL!`);
      console.log(`   - ${transactionCount} SPA transactions created`);
      console.log(`   - ${notificationCount} notifications created`);
      console.log(`   - Migration script worked correctly`);
    } else if (transactionCount > 0 || notificationCount > 0) {
      console.log(`⚠️  PARTIAL SUCCESS:`);
      console.log(`   - ${transactionCount} SPA transactions`);
      console.log(`   - ${notificationCount} notifications`);
      console.log(`   - Some data was migrated`);
    } else {
      console.log(`❌ NO MIGRATION DATA FOUND`);
      console.log(`   - Either migration failed or no data to migrate`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

serviceRoleCheck();
